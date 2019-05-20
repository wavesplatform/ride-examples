import com.wavesplatform.wavesj.*;
import com.wavesplatform.wavesj.json.WavesJsonMapper;
import com.wavesplatform.wavesj.transactions.InvokeScriptTransaction;
import com.wavesplatform.wavesj.transactions.InvokeScriptTransaction.FunctionalArg;
import com.wavesplatform.wavesj.transactions.InvokeScriptTransaction.FunctionCall;

import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;

import static com.wavesplatform.wavesj.Hash.*;
import static java.lang.Integer.parseInt;
import static java.lang.System.currentTimeMillis;
import static java.time.format.DateTimeFormatter.ofPattern;
import static java.util.Arrays.asList;
import static java.util.Map.Entry.comparingByKey;
import static java.util.concurrent.TimeUnit.SECONDS;
import static java.util.stream.Collectors.*;
import static java.util.Map.Entry.comparingByValue;

public class RudechainMiner {

    Node node;
    PrivateKeyAccount miner;
    String minerAccount;
    String rudechain;

    public RudechainMiner(String seedText) throws URISyntaxException, IOException {
        node = new Node("https://testnode4.wavesnodes.com", 'T'); //TODO host to conf file
        miner = PrivateKeyAccount.fromSeed(seedText, 0, (byte) 'T'); //TODO chainId to conf file
        rudechain = "3MwgRB2FJzbquEZEnySc2jwhpaZnoWvCMJX"; //TODO to conf file
        System.out.println(miner.getAddress());
        minerAccount = node.getDataByKey(
                rudechain, "$" + miner.getAddress()).getValue().toString();
    }

    void tryToMineOnce() throws IOException, InterruptedException {
        log("Preparing...");

        long nonce = 0, to = Long.MIN_VALUE;

        int difficulty = parseInt(node.getDataByKey(rudechain, "last").getValue().toString().split(",")[6]);
        BlockHeader refLast = node.getLastBlockHeader();
        String[] blockHeaders;
        while (true) {
            int wavesHeight = node.getHeight();
            blockHeaders = node.getDataByKey(rudechain, "last")
                    .getValue().toString().split(";")[0].split(",");
            int refHeight = parseInt(blockHeaders[2]);
            int delta = wavesHeight - refHeight;

            if (refHeight == wavesHeight) {
                Thread.sleep(1000);
                continue;
            } else if (asList(2, 3).contains(delta) || difficulty == 1) {
                difficulty += 1;
                break;
            } else if (delta == 1) {
                difficulty += 3;
                break;
            } else if (difficulty - (delta / 2) > 0) {
                difficulty -= delta / 2;
                break;
            } else {
                difficulty = 1;
            }
        }
        //TODO if I'm a new miner - spy and process utx until height arise. Else mine again
        //TODO When height is up - mine again
        log("Start mining with difficulty " + difficulty);
        String hash;
        do {
            nonce--;

            //timestamp, refHeight, minerAccountName, nonce, prevHash (of current last block)
            String source = refLast.getTimestamp() + refLast.getHeight() + minerAccount + nonce + blockHeaders[0];
            hash = Base58.encode(
                    Hash.hash(source.getBytes(), 0, source.getBytes().length, BLAKE2B256)
            );
            byte[] hashBytes = (hash + source).getBytes();

            short zeros = 0;
            for (byte b : hashBytes) {
                if (b == 0) {
                    zeros += 8;
                } else {
                    zeros += 7 - (int) Math.floor(mathLog2(b)); //TODO пропадают 8, 16, 24, 32
                    break;
                }
            }
            if (zeros < difficulty) {
                continue;
            }

            log("generated '" + hash + "' with first " + zeros + " zero bytes from source '" + source + "'");
            break;
        } while (nonce > to);

        String id = sendKeyBlock(nonce);
        log(id);

        boolean isTxInBlockchain = waitForTx(id);

        if (!isTxInBlockchain) {
            throw new IOException("can't mine key block: tx '" + id + "' is not in blockchain");
        } else log("you're the miner now!");

    }

    String sendKeyBlock(long nonce) throws IOException {
        InvokeScriptTransaction tx = new InvokeScriptTransaction((byte) 'T', miner, rudechain,
                new FunctionCall("mine").addArg(nonce),
                new ArrayList<>(), 500000, null, System.currentTimeMillis(), new ArrayList<>()
        ).sign(miner);
        return node.send(tx);
    }

    void utxProcessing() throws IOException, InterruptedException {
        String utx = node.getDataByKey(rudechain, "utx").getValue().toString();
        if (utx.length() < 2) {
            log("UTX is empty now");
        } else {
            InvokeScriptTransaction tx = new InvokeScriptTransaction((byte) 'T', miner, rudechain,
                    "utxProcessing", 500000, null, System.currentTimeMillis()
            ).sign(miner);
            String id = node.send(tx);
            boolean isTxInBlockchain = waitForTx(id);
            log(String.valueOf(isTxInBlockchain));
        }
    }

    private boolean waitForTx(String id) throws InterruptedException {
        boolean isTxInBlockchain = false;
        for (int attempt = 0; attempt < 120; attempt++) {
            try {
                node.getTransaction(id);
                isTxInBlockchain = true;
                break;
            } catch (IOException e) {
                Thread.sleep(1000);
            }
        }
        return isTxInBlockchain;
    }

    double mathLog2(int num) {
        return Math.log10(num) / Math.log10(2);
    }

    private void log(String message) {
        String time = LocalDateTime.now().format(ofPattern("yyyy-MM-dd'T'HH:mm:ss"));
        System.out.print(time + "> " + message + "\n");
    }

}