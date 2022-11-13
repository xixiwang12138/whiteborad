import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;

public class Test {
    public static void main(String[] args) {
        System.out.println(Files.exists(Paths.get(".o")));
        System.out.println(new File(".out").exists());
    }
}
