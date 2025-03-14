import { FilterQuery, Query } from "mongoose"


class QueryBuilder<T> {
    public modelQuery:Query<T[],T>
    public query:Record<string,unknown>


    constructor(modelQuery: Query<T[],T>,query:Record<string,unknown>) {
        this.modelQuery = modelQuery
        this.query = query
    }

    search(productSearchableFields: string[]) {
        const searchTerm = this?.query?.searchTerm;
        if (searchTerm) {
          this.modelQuery = this.modelQuery.find({
            $or: productSearchableFields.map(
              (field) =>
                ({
                  [field]: { $regex: searchTerm, $options: 'i' },
                }) as FilterQuery<T>,
            ),
          });
        }
    
        return this;
      }

    filter() {
        const queryObj = {...this.query}

        const excludeFields = ['searchTerm','sort','limit','page']

        excludeFields.forEach(el => delete queryObj[el])

        this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>)

        return this

    }


}


export default QueryBuilder