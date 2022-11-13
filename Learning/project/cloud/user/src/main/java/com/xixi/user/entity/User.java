package com.xixi.user.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserContext implements Serializable {
    /**
     * 用户id
     */
    private Long id;

    /**
     * 冻结时间,注意时间使用long保存毫秒
     */
    private Long freezeTime;

    /**
     * 昵称
     */
    private String nickname;

    /**
     * 头像url
     */
    private String avatar;

    /**
     * 性别
     * 0-保密
     * 1-男
     * 2-女
     */
    private Integer sex;

    /**
     * 生日
     */
    private Long birthday;

    /**
     * 个人简介
     */
    private String description;

    /**
     * 经验值
     */
    private Long experience;
}
