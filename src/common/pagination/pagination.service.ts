// src/common/pagination/pagination.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../modules/prisma/prisma.service';
import { PagedList } from './paged-list';
import { PaginationDto } from '../dtos/pagination.dto';

@Injectable()
export class PaginationService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Executa uma consulta paginada em qualquer modelo do Prisma
   */
  async paginate<T>(
    model: any,
    params: PaginationDto,
    whereCondition?: any,
    include?: any
  ): Promise<PagedList<T>> {
    const { 
      page = 1, 
      pageSize = 10, 
      sortBy, 
      sortOrder = 'asc'
    } = params;
    
    const skip = (page - 1) * pageSize;
    
    // Configurar ordenação se fornecida
    const orderBy = sortBy ? { [sortBy]: sortOrder } : undefined;

    // Executar consultas em paralelo
    const [totalCount, items] = await Promise.all([
      // Contar todos os registros que correspondem ao filtro
      model.count({ where: whereCondition }),
      
      // Buscar a página atual de itens
      model.findMany({
        where: whereCondition,
        skip,
        take: pageSize,
        orderBy,
        include
      })
    ]);
    
    return new PagedList<T>(items, totalCount, page, pageSize);
  }
}