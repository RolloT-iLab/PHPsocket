<?php
require __DIR__ . '/vendor/autoload.php';

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class SimpleWebSocketServer implements MessageComponentInterface {

    protected $clients;

    public function __construct() {
        $this->clients = new \SplObjectStorage;
        echo "WebSocket server started...\n";
    }

    public function onOpen(ConnectionInterface $conn) {
        $this->clients->attach($conn);
        echo "New connection ({$conn->resourceId})\n";
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        echo "Received from {$from->resourceId}: $msg\n";

        $msg = trim($msg);

        foreach ($this->clients as $client) {
            $client->send($msg);
        }

        $from->send("Server received: $msg");
    }

    public function onClose(ConnectionInterface $conn) {
        $this->clients->detach($conn);
        echo "Connection {$conn->resourceId} disconnected\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "Error: {$e->getMessage()}\n";
        $conn->close();
    }
}

/*
|--------------------------------------------------------------------------
| REPLACE Ratchet\App WITH EXPLICIT SOCKET BINDING
|--------------------------------------------------------------------------
*/

use React\EventLoop\Factory;
use React\Socket\SocketServer;
use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;

$loop = Factory::create();

// Force bind to all interfaces
$socket = new SocketServer('0.0.0.0:8080', [], $loop);

$server = new IoServer(
    new HttpServer(
        new WsServer(
            new SimpleWebSocketServer()
        )
    ),
    $socket,
    $loop
);

echo "Server running on 0.0.0.0:8080\n";

$loop->run();