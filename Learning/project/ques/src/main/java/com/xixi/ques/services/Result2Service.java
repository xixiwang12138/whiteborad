package com.xixi.ques.services;

import com.xixi.ques.ExcelUtil;
import com.xixi.ques.entity.*;
import com.xixi.ques.mappers.Result2Mapper;
import com.xixi.ques.mappers.ResultMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class Result2Service {
    @Autowired
    private Result2Mapper result2Mapper;

    public void excelExport(HttpServletResponse response) throws IOException {
        ArrayList<String> nameList = new ArrayList<String>();
        String[] name = new String[]{"序号","就业城市", "年薪（税前）", "学校所在区域", "学校性质", "学校类型", "职称晋升", "是否编制内", "性别", "年级", "政治面貌", "就读院校类别", "所学专业", "生源地省份","生源地城市", "入学前的户口类型", "家庭年均收入"};
        for (String i : name) {
            nameList.add(i);
        }

        List<List<String>> fileContent = new ArrayList<>();
        List<InResult2> list = result2Mapper.selectAll();
        for (InResult2 ir : list) {
            ArrayList<String> arrayList = new ArrayList<>();
            try {
                arrayList = ExcelUtil.convert(ir);
            } catch (Exception e) {
                e.printStackTrace();
            }
            fileContent.add(arrayList);
        }
        ExcelUtil.uploadExcelAboutUser(response, "问卷结果", nameList, fileContent);
    }


}
