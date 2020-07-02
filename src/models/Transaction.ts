import { Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from "typeorm";
import Category from "./Category";

@Entity('transactions')
class Transaction {
  
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  type: 'income' | 'outcome';

  @Column('decimal')
  value: number;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category

  @Column()
  category_id: string

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default Transaction;
