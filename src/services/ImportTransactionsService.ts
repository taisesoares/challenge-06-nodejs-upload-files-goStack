import { getCustomRepository, getRepository, In } from 'typeorm'
import csvParse from 'csv-parse'
import fs from 'fs'

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository'

interface CSVTransations { 
  title: string
  type: 'income' | 'outcome'
  value: number
  category: string
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const transactionRepository = getCustomRepository(TransactionsRepository)
    const categoryRepository = getRepository(Category)

    const contactsReadStream = fs.createReadStream(filePath)

    const parsers = csvParse({
      from_line: 2
    })

    const parseCSV = contactsReadStream.pipe(parsers)

    const transactions: CSVTransations[] = []

    const categories: string[] = []

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim()
      )

      if ( !title || !type || !value ) return;

      categories.push(category)
      transactions.push({ title, type, value, category })
    })
   
    await new Promise(resolve => parseCSV.on('end', resolve))

    const existentCategories = await categoryRepository.find({ where: { title: In(categories)} })
    
    const existentCategoriesTitles = existentCategories.map( (category: Category) => category.title )

    const addCategoryTitle = categories
      .filter(category => !existentCategoriesTitles.includes(category))
        .filter((value, index, self) => self.indexOf(value) === index)
    
    const newCategories = categoryRepository.create(addCategoryTitle.map(title => ({ title })))

    await categoryRepository.save(newCategories)

    const finalCategories = [ ...newCategories, ...existentCategories ]

    const createdTransactions = transactionRepository.create(transactions.map(transaction => ({
      title: transaction.title,
      type: transaction.type,
      value: transaction.value,
      category: finalCategories.find(category => category.title === transaction.category)
    })))

    await transactionRepository.save(createdTransactions)

    await fs.promises.unlink(filePath)

    return createdTransactions
  }
}

export default ImportTransactionsService;
