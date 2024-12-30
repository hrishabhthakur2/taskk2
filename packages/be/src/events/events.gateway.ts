import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
// import { jwt_config } from 'src/config/jwt.config';
import { Message } from './message.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: { origin: 'http://localhost:3000', credentials: true },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private users = [];
  private clients = [];

  constructor(
    @InjectRepository(Message) private msgRepo: Repository<Message>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  @SubscribeMessage('message')
  async handleMessage(client: any, payload: any): Promise<string> {
    const { recipient, text, file } = payload;

    console.log(client.user);
    console.log(payload);

    console.log(file);

    if (file) {
      console.log({ file });
    }

    if (recipient && (text || file)) {
      const msgDoc = await this.msgRepo.save({
        sender: client.user.id,
        recipient,
        text,
        file: file ? file : null,
      });

      for (let i = 0; i < this.clients.length; i++) {
        if (this.clients[i].user.id == recipient) {
          this.clients[i].emit('message', {
            sender: client.user.id,
            text,
            id: msgDoc.id,
            recipient,
          });
        }
      }
    }

    return 'Hello world!';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleConnection(client: any, socket: Socket, ...args: any[]) {
    const cookieString: string = client.handshake.headers.cookie;
    const tokenString = cookieString
      .split(';')
      .map((str) => str.trim())
      .find((str) => str.startsWith('token='));
    let token: string;

    if (tokenString) {
      token = tokenString.split('=')[1];

      try {
        const user = this.jwtService.verify(token, {
          secret: this.configService.get('JWT_SECRET'),
        });
        console.log(user);

        client.user = user;
        this.users.push(user);
        this.clients.push(client);

        this.server.emit('onlineUsers', {
          online: this.users,
        });
      } catch (error) {
        console.log(error);
      }
    }

    console.log(this.users);
    for (let i = 0; i < this.clients.length; i++) {
      console.log(this.clients[i].user);
    }
  }

  handleDisconnect(client: any) {
    console.log('disconnected');

    const cookieString: string = client.handshake.headers.cookie;
    const tokenString = cookieString
      .split(';')
      .map((str) => str.trim())
      .find((str) => str.startsWith('token='));
    let token: string;

    if (tokenString) {
      token = tokenString.split('=')[1];

      try {
        const user = this.jwtService.verify(token, {
          secret: this.configService.get('JWT_SECRET'),
        });
        const usersUpdate = this.users.filter((item) => item.id != user.id);

        this.users = usersUpdate;

        this.server.emit('onlineUsers', {
          online: this.users,
        });
      } catch (error) {
        console.log(error);
      }
    }
  }
}
