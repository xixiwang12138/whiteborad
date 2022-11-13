package com.xixi.ques.controller;

import com.xixi.ques.entity.JsonResult;
import com.xixi.ques.entity.Resume;
import com.xixi.ques.services.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController

public class PostController {
    @Autowired
    private PostService postService;

    @GetMapping()
    public JsonResult getRandomInfo(){
        Resume randomResume = postService.getRandomResume();
        return new JsonResult(true,randomResume);
    }
}
