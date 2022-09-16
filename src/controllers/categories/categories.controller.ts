import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Logger,
  Param,
  Post,
  Put,
  Render,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ICreateCategoryDto } from 'src/dto/create_category.dto';
import { AuthFailedFilter } from 'src/filters/auth-failed.filter';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import injectionTokenKeys from 'src/injection-tokens';
import { CategoriesService } from 'src/services/categories/categories.service';
import { UsersService } from 'src/services/users/users.service';
import { BaseController } from '../base/base.controller';

@Controller('categories')
@UseGuards(AuthGuard)
@UseFilters(AuthFailedFilter)
export class CategoriesController extends BaseController {
  private readonly logger = new Logger(CategoriesController.name);

  constructor(
    @Inject(injectionTokenKeys.appName) appName: string,
    private readonly categoryService: CategoriesService,
    usersService: UsersService,
  ) {
    super(appName, usersService);
  }

  @Get()
  @Render('categories/categories')
  async viewCategories() {
    const categories = await this.categoryService.getCategories();
    return { data: { categories: categories }, view: this.viewBag };
  }

  @Get(':id')
  async getCategory(@Param('id') id: number, @Res() res: Response) {
    const category = await this.categoryService.getCategory(id);
    return res.json(category);
  }

  @Post()
  async storeCategory(
    @Body() createCategoryDto: ICreateCategoryDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const errors: string[] = [];

    if (!createCategoryDto.name || createCategoryDto.name.length <= 0) {
      errors.push('Category name required');
      return res
        .status(400)
        .json({ message: 'Unable to create category.', errors: errors });
    }

    const stored = await this.categoryService.createCategory(createCategoryDto);

    if (stored.success)
      return res
        .status(201)
        .json({ message: 'Category created successfully.' });
    else return res.status(500).json({ message: stored.error });
  }

  @Put(':id')
  async updateCategory(
    @Body() updateCategoryDto: ICreateCategoryDto,
    @Param('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const updated = await this.categoryService.updateCategory(
      updateCategoryDto,
      id,
    );

    if (updated.success)
      return res.json({ message: 'Category updated successfully.' });
    else return res.status(500).json({ message: 'Unable to update category.' });
  }

  @Delete(':id')
  async deleteCategory(
    @Param('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const deleted = await this.categoryService.deleteCategory(id);

    if (deleted.success)
      return res.json({ message: 'Category deleted successfully.' });
    else return res.status(500).json({ message: 'Unable to delete category.' });
  }
}
