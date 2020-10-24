import { Message, Stan } from 'node-nats-streaming';
import { Subjects } from './subjects';

interface Event {
  subject: Subjects;
  data: any;
}
export abstract class Listener<T extends Event> {
  abstract subject: T['subject'];
  abstract onMessage(data: T['data'], msg: Message): void;
  abstract queueGroupName: string;
  private client: Stan;
  protected ackWait = 5000;

  constructor(client: Stan) {
    this.client = client;
  }
  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setDeliverAllAvailable()
      .setDurableName(this.queueGroupName)
      .setManualAckMode(true)
      .setAckWait(this.ackWait);
  }

  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
    );

    subscription.on('message', (msg: Message) => {
      console.log(`Message Recieved ${this.subject} / ${this.queueGroupName}`);
      const parsedData = this.parseMessage(msg);
      this.onMessage(parsedData, msg);
    });
  }
  parseMessage(msg: Message) {
    const data = msg.getData();
    return typeof data === 'string'
      ? JSON.parse(data)
      : JSON.parse(data.toString('utf8'));
  }
}