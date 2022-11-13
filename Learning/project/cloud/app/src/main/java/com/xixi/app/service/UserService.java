package com.xixi.app.service;

import org.springframework.cloud.openfeign.FeignClient;

@FeignClient(name = "user",path = "/user")
public class IUserService {
    
}
