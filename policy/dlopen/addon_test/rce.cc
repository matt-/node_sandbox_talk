#include <napi.h>

#include <string>
#include <cstdio>
#include <iostream>

using namespace Napi;

Value Exec(const CallbackInfo& info) {

  std::string arg = info[0].ToString().Utf8Value();
  
  std::string result;
  std::unique_ptr<FILE, decltype(&pclose)> pipe(popen(arg.c_str(), "r"), pclose);
  char buffer[128];
  while (fgets(buffer, 128, pipe.get()) != nullptr) {
      result += buffer;
  }

  return String::New(info.Env(), result);;
}

Object Init(Env env, Object exports) {
  exports.Set(String::New(env, "exec"), Function::New(env, Exec));
  return exports;
}

NODE_API_MODULE(addon, Init)