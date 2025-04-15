// src/common/pagination/paged-list.ts
export class PagedList<T> {
  /**
   * Lista de itens da página atual
   */
  items: T[];

  /**
   * Número total de itens em todas as páginas
   */
  totalCount: number;

  /**
   * Página atual
   */
  currentPage: number;

  /**
   * Número de itens por página
   */
  pageSize: number;

  /**
   * Total de páginas
   */
  totalPages: number;

  /**
   * Indica se há uma página anterior
   */
  hasPreviousPage: boolean;

  /**
   * Indica se há uma próxima página
   */
  hasNextPage: boolean;

  constructor(
    items: T[],
    totalCount: number,
    currentPage: number,
    pageSize: number,
  ) {
    this.items = items;
    this.totalCount = totalCount;
    this.currentPage = currentPage;
    this.pageSize = pageSize;

    // Cálculos derivados
    this.totalPages = Math.ceil(totalCount / pageSize);
    this.hasPreviousPage = currentPage > 1;
    this.hasNextPage = currentPage < this.totalPages;
  }

  /**
   * Cria uma instância de PagedList a partir do resultado da extensão de paginação do Prisma
   */
  static fromPrismaPaginationResult<T>(result: any): PagedList<T> {
    return new PagedList<T>(
      result.data,
      result.meta.total,
      result.meta.currentPage,
      result.meta.perPage,
    );
  }

  /**
   * Cria uma instância de PagedList vazia
   */
  static empty<T>(): PagedList<T> {
    return new PagedList<T>([], 0, 1, 10);
  }

  /**
   * Mapeia os itens da lista paginada usando uma função de transformação
   */
  async mapAsync<R>(mapFn: (item: T) => Promise<R>): Promise<PagedList<R>> {
    const mappedItems = await Promise.all(this.items.map(mapFn));

    return new PagedList<R>(
      mappedItems,
      this.totalCount,
      this.currentPage,
      this.pageSize,
    );
  }

  /**
   * Versão síncrona do método map
   */
  map<R>(mapFn: (item: T) => R): PagedList<R> {
    const mappedItems = this.items.map(mapFn);

    return new PagedList<R>(
      mappedItems,
      this.totalCount,
      this.currentPage,
      this.pageSize,
    );
  }
}
