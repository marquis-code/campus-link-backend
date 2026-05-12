import { Model } from 'mongoose';
import { CampusDocument } from '../../schemas/campus.schema';
import { CategoryDocument } from '../../schemas/category.schema';
export declare class SeedService {
    private campusModel;
    private categoryModel;
    constructor(campusModel: Model<CampusDocument>, categoryModel: Model<CategoryDocument>);
    seed(): Promise<void>;
}
