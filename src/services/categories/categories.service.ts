import { Injectable, Logger } from '@nestjs/common';
import { randomBytes, randomUUID } from 'crypto';
import { ICreateCategoryDto } from 'src/dto/create_category.dto';
import { Category } from 'src/entities/category.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  private readonly categoryRepository: Repository<Category>;
  private readonly logger = new Logger(CategoriesService.name)

  constructor (datasource: DataSource) {
    this.categoryRepository = datasource.getRepository(Category);
  }


  /**
   * Store newly created category.
   * 
   * @param dto New category data
   * @returns 
   */
  async createCategory(dto: ICreateCategoryDto) {
    const exists = await this.categoryRepository.findOneBy({ name: dto.name })
    if (exists) {
      this.logger.warn(`Failed category creation attempt - Category with same name already exists.`)
      return { success: false, error: 'Category already exists' }
    }

    let category = new Category()
    category.name = dto.name
    category.description = dto.description
    category = await this.categoryRepository.save(category)

    this.logger.log(`New category created with ID #${category.id}`)
    return { success: true, category: category }
  }

  async updateCategory(dto: ICreateCategoryDto, id: number) {
    const category = await this.categoryRepository.findOneBy({ id: id })

    category.name = dto.name
    category.description = dto.description
    
    await this.categoryRepository.save(category)
    this.logger.log(`Category with ID #${category.id} updated`)

    return { success: true, category: category }
  }

  async deleteCategory(id: number) {
    const category = await this.categoryRepository.findOneBy({ id: id })
    
    if (category) {
      await this.categoryRepository.delete(id)
      return { success: true }
    } else {
      return { success: false, error: "Category doesn't exists" }
    }
  }

  async getCategories() {
    const categories = await this.categoryRepository.find()
    return categories
  }

  async getCategory(id: number) {
    const category = await this.categoryRepository.findOneBy({ id: id })
    return category
  }
}
