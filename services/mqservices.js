const amqp = require('amqplib/callback_api');

let amqpConnection = null;
let mainChannel = null;

module.exports = {
    connect: (finishConnect, persist) => {
        amqp.connect(process.env.CLOUDAMQP_URL, (err, conn) => {
            conn.createChannel((err, channel) => {
                mainChannel = channel;
            });
            conn.on('error', (err) => {
                console.error("[AMQP] conn error", err.message);
            });
            conn.on('exit', (code) => {
                ch.close();
                console.log(`Closing rabbitmq channel -> ${code}`);
            });
            conn.on("close", () => {
                // Reconnect when connection was closed
                console.error("[AMQP] reconnecting");
                return setTimeout(() => { module.exports.InitConnection(fnFinish) }, 1000);
            });
            conn.createChannel((err, ch) => {
                mainChannel.consume('db-insert-queue', (msg) => {
                    setTimeout(() => {
                        persist(msg.content.toString());
                    }, 50);
                }, { noAck: true }
                );
            });
            console.log("[AMQP] connected");
            amqpConnection = conn;
            finishConnect();
        });
    }
}
