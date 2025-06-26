#include "MessageServer.h"

// это конструктор, который принимает параметры текст и id
Message::Message(const std::string& text, const std::string& id)
    : text(text), id(id.empty() ? generateUUID() : id) {
}

const std::string& Message::getId() const { return id; }
const std::string& Message::getText() const { return text; }
int Message::getLikes() const { return likes; }
std::time_t Message::getLastLikeTime() const { return last_like_time; }

// увеличивает like на 1 и обновляет время like
void Message::addLike() {
    likes++;
    last_like_time = std::time(nullptr);
}

// уменьшает like на 1 
void Message::removeLike() {
    likes--;
    if (likes < 0) likes = 0;
}

std::string Message::generateUUID() {
    static const char hex_chars[] = "0123456789abcdef";
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dis(0, 15);

    std::string uuid(36, ' ');
    for (size_t i = 0; i < 36; i++) {
        if (i == 8 || i == 13 || i == 18 || i == 23) {
            uuid[i] = '-';
        }
        else {
            uuid[i] = hex_chars[dis(gen)];
        }
    }
    return uuid;
}

// управляет списком сообщений и их сортировкой по like
void MessageStorage::updateMessagePosition(std::list<Message>::iterator it) {
    auto current = it;
    while (current != messages.begin()) {
        auto prev = std::prev(current);
        if (current->getLikes() > prev->getLikes() ||
            (current->getLikes() == prev->getLikes() &&
                current->getLastLikeTime() > prev->getLastLikeTime())) {
            messages.splice(prev, messages, current);
            current = prev;
        }
        else {
            break;
        }
    }
}

// добавляем сообщение в конец нашего списка
void MessageStorage::addMessage(const Message& msg) {
    messages.push_back(msg);
}

// идет обработка like.  Находим по id вызываем addLike или removeLike, далее обновляем позицию
void MessageStorage::processLike(const std::string& id, bool liked) {
    auto it = std::find_if(messages.begin(), messages.end(),
        [&id](const Message& m) { return m.getId() == id; });

    if (it != messages.end()) {
        if (liked) {
            it->addLike();
        }
        else {
            it->removeLike();
        }
        updateMessagePosition(it);
    }
}

// преобразуем в формат json
std::string MessageStorage::buildResponse() const {
    json responseJson;
    for (const auto& msg : messages) {
        responseJson.push_back({
            {"id", msg.getId()},
            {"text", msg.getText()},
            {"likes", msg.getLikes()},
            {"last_like_time", msg.getLastLikeTime()}
            });
    }
    return responseJson.dump();
}

int runServer() {
    // до следующего комментария идет найстройка сервера
    WSADATA wsaData;
    if (WSAStartup(MAKEWORD(2, 2), &wsaData)) {
        std::cerr << "WSAStartup failed\n";
        return 1;
    }

    SOCKET serverSocket = socket(AF_INET, SOCK_STREAM, 0);
    if (serverSocket == INVALID_SOCKET) {
        std::cerr << "Socket creation failed\n";
        WSACleanup();
        return 1;
    }
    
    sockaddr_in serverAddr{};
    serverAddr.sin_family = AF_INET;
    serverAddr.sin_addr.s_addr = INADDR_ANY;
    serverAddr.sin_port = htons(PORT);

    if (bind(serverSocket, (sockaddr*)&serverAddr, sizeof(serverAddr)) < 0) {
        std::cerr << "Bind failed\n";
        closesocket(serverSocket);
        WSACleanup();
        return 1;
    }

    if (listen(serverSocket, 5) < 0) {
        std::cerr << "Listen failed\n";
        closesocket(serverSocket);
        WSACleanup();
        return 1;
    }

    std::cout << "Server listening on port " << PORT << "...\n";

    MessageStorage storage;

    while (true) { //цикл
        sockaddr_in clientAddr{};
        int addrLen = sizeof(clientAddr);
        SOCKET clientSocket = accept(serverSocket, (sockaddr*)&clientAddr, &addrLen);

        if (clientSocket == INVALID_SOCKET) {
            std::cerr << "Accept failed\n";
            continue;
        }

        char buffer[4096] = { 0 };
        int bytesReceived = recv(clientSocket, buffer, sizeof(buffer) - 1, 0);

        if (bytesReceived > 0) {
            buffer[bytesReceived] = '\0';
            std::string request(buffer);

            if (request.find("OPTIONS") != std::string::npos) {
                std::string optionsResponse =
                    "HTTP/1.1 200 OK\r\n"
                    "Access-Control-Allow-Origin: *\r\n"
                    "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n"
                    "Access-Control-Allow-Headers: Content-Type\r\n"
                    "Content-Length: 0\r\n"
                    "\r\n";
                send(clientSocket, optionsResponse.c_str(), optionsResponse.size(), 0);
                closesocket(clientSocket);
                continue;
            }

            if (request.find("POST") != std::string::npos) { //добавляет сообщение и обрабатывает like, отправляет json
                size_t bodyStart = request.find("\r\n\r\n");
                if (bodyStart != std::string::npos) {
                    std::string jsonStr = request.substr(bodyStart + 4);
                    try {
                        json data = json::parse(jsonStr);

                        if (data.contains("message")) {
                            Message newMsg(data["message"]);
                            storage.addMessage(newMsg);
                        }

                        if (data.contains("likes") && data["likes"].is_object()) {
                            for (const auto& like_item : data["likes"].items()) {
                                const std::string& id = like_item.key();
                                const auto& value = like_item.value();

                                if (value.is_boolean()) {
                                    storage.processLike(id, value.get<bool>());
                                }
                            }
                        }
                    }
                    catch (const std::exception& e) {
                        std::cerr << "JSON error: " << e.what() << "\n";
                    }
                }
            }

            std::string responseData = storage.buildResponse();
            std::string response =
                "HTTP/1.1 200 OK\r\n"
                "Content-Type: application/json\r\n"
                "Access-Control-Allow-Origin: *\r\n"
                "Content-Length: " + std::to_string(responseData.size()) + "\r\n"
                "\r\n" + responseData;

            send(clientSocket, response.c_str(), response.size(), 0);
        }
        closesocket(clientSocket);
    }

    closesocket(serverSocket);
    WSACleanup();
    return 0;
}

int main() {
    return runServer();
}