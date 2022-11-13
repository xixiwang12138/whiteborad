package com.xixi.user;

import com.xixi.user.entity.CommonResult;
import com.xixi.user.entity.User;
import com.xixi.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("user")
public class controller {

    @Autowired
    private UserService userService;

    @PostMapping
    public CommonResult<Void> creat(User user){
        CommonResult<Void> result = userService.create(user);
        return result;
    }

    @GetMapping("{id}")
    public CommonResult<User> get(@PathVariable Long id){
        return userService.get(id);
    }


    @GetMapping("phone/{phoneNumber}")
    public CommonResult<User> getNyPhoneNumber(@PathVariable String phoneNumber){
        return userService.getByPN(phoneNumber);
    }

    @DeleteMapping("{id}")
    public CommonResult<Void> delete(@PathVariable Long id){
        return userService.delete(id);
    }

    @PostMapping("/update")
    public CommonResult<Void> update(User user){
        CommonResult<Void> result = userService.update(user);
        return result;
    }





}
