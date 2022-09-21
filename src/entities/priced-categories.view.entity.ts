import { DataSource, ViewColumn, ViewEntity } from "typeorm";
import { Category } from "./category.entity";
import { ProductServicePrice } from "./product-service-price.entity";
import { Product } from "./product.entity";
import { OfferedService } from "./service.entity";

@ViewEntity({
    expression: (dataSource: DataSource) => {
        return dataSource.createQueryBuilder()
            .select('c.id', 'category_id')
            .addSelect('c.name', 'category_name')
            .addSelect('p.id', 'product_id')
            .addSelect('p.icon_url')
            .addSelect('pp.fast_price')
            .addSelect('pp.normal_price')
            .addSelect('pp.date_created', 'pricing_date')
            .from(ProductServicePrice, 'pp')
            .innerJoin(Product, 'p', 'p.id = pp.product_id')
            .innerJoin(OfferedService, 's', 's.id = pp.service_id')
            .leftJoin(Category, 'c', 'c.id = p.category_id')
            .groupBy('c.id')
            .addGroupBy('p.id')
            .addGroupBy('s.id');
    }
})
export class PricedCategoriesView {
    @ViewColumn()
    categoryId?: number;

    @ViewColumn()
    categoryName?: string;

    @ViewColumn()
    productId?: number;

    @ViewColumn()
    iconUrl?: string;

    @ViewColumn()
    fastPrice?: number;

    @ViewColumn()
    normalPrice?: number;

    @ViewColumn()
    pricingDate?: Date;
}