import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

export enum TemplateChannel {
  WHATSAPP = 'whatsapp',
  EMAIL = 'email',
}

@Entity('message_templates')
export class MessageTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: TemplateChannel })
  channel: TemplateChannel;

  @Column()
  name: string;

  @Column({ nullable: true })
  subject: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'jsonb', nullable: true })
  variables: string[];
}
