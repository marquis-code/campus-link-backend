import { CampusesService } from './campuses.service';
import { CreateCampusDto, UpdateCampusDto } from './dto/campus.dto';
export declare class CampusesController {
    private campusesService;
    constructor(campusesService: CampusesService);
    findAll(): Promise<any>;
    findAllAdmin(): Promise<(import("../../schemas/campus.schema").Campus & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findOne(id: string): Promise<import("../../schemas/campus.schema").Campus & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    create(dto: CreateCampusDto): Promise<import("mongoose").Document<unknown, {}, import("../../schemas/campus.schema").CampusDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/campus.schema").Campus & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, dto: UpdateCampusDto): Promise<import("../../schemas/campus.schema").Campus & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
