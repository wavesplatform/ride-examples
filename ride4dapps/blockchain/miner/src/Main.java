import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Paths;

import static java.util.Arrays.asList;

public class Main {

    public static void main(String[] args) throws IOException, URISyntaxException, InterruptedException {
        RudechainMiner rc = new RudechainMiner(
                Files.readAllLines(Paths.get("seed.conf")).get(0)
        );

        if (args.length == 0 || !asList("mine", "utx").contains(args[0]))
            System.err.println("Provide command 'mine' or 'utx'!");
        else if ("mine".equals(args[0])) {
            rc.tryToMineOnce();
        } else if ("utx".equals(args[0])) {
            rc.utxProcessing();
        }
    }

}
