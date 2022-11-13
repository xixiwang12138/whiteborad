import com.alibaba.excel.annotation.ExcelProperty;

public class POJO {
    @ExcelProperty(value = {"城市"})
    private String city;

    @ExcelProperty(value = {"学生信息"})
    private double PM25;
    private double O3;
    private int year;
    private int month;
}
