import { compareMerchantIndex } from "../repositories/mongoRepository.js";

export async function compareIndexPerformance() {
    return compareMerchantIndex();
}
