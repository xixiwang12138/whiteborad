package com.xixi.ques.services;

import com.xixi.ques.entity.Resume;
import org.springframework.stereotype.Service;

@Service
public class PostService {

    private static final Integer[] AGES = {35,40,45,50};
    private static final String[] REGION = {"湖南","广东" ,"河南" ,"四川","辽宁"};
    private static final String[] REGISTRATION = {"城镇户口", "农村户口"  };
    private static final String[] FAMILY = {"家庭唯一收入来源", "家庭经济基础良好"   };
    private static final String[] APPRAISE = {"上班准时、能做好分内之事", "能主动找活做"   };

    private static final String[] SKILLS = {"无", "初级工职业技能证书"   };

    private static final String[] WORK = {"从事家政行业2年", "从事家政行业6年","从事家政行业4年"};
    private static final String[] EDUCATION = {"初中", "高中","大专"};
    private static final String[] MARRIED = {"离异", "已婚"};

    public Resume getRandomResume(){
        //随机获取属性值
        Integer age = AGES[getRandomIndex(AGES)];
        String region = REGION[getRandomIndex(REGION)];
        String register = REGISTRATION[getRandomIndex(REGISTRATION)];
        String family = FAMILY[getRandomIndex(FAMILY)];
        String appraise = APPRAISE[getRandomIndex(APPRAISE)];
        String skill = SKILLS[getRandomIndex(SKILLS)];
        String work = WORK[getRandomIndex(WORK)];
        String education = EDUCATION[getRandomIndex(EDUCATION)];
        String married = MARRIED[getRandomIndex(MARRIED)];
        return new Resume(age,region,register,family,appraise,skill,work,education,married);
    }
    
    private static int getRandomIndex(Object[] arr){
        int n = arr.length;
        return (int) (Math.random() * n);
    }
}
