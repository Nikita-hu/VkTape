#ifndef MESSAGE_SERVER_H
#define MESSAGE_SERVER_H

#include <iostream>
#include <list>
#include <string>
#include <ctime>
#include <algorithm>
#include <random>
#include <winsock2.h>
#include <ws2tcpip.h>
#include "json.hpp"

#pragma comment(lib, "ws2_32.lib")

#define PORT 12345

using json = nlohmann::json;

class Message {
private:
    std::string id;
    std::string text;
    int likes = 0;
    std::time_t last_like_time = 0;

public:
    Message(const std::string& text, const std::string& id = "");

    const std::string& getId() const;
    const std::string& getText() const;
    int getLikes() const;
    std::time_t getLastLikeTime() const;

    void addLike();
    void removeLike();
    static std::string generateUUID();
};

class MessageStorage {
private:
    std::list<Message> messages;

    void updateMessagePosition(std::list<Message>::iterator it);

public:
    void addMessage(const Message& msg);
    void processLike(const std::string& id, bool liked);
    std::string buildResponse() const;
};

int runServer();

#endif