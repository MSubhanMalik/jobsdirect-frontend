import { useQuery } from "@tanstack/react-query";
import productService from "@/services/product";
import type { Product } from "@/types/product";

export function useProducts() {
  const { data = [], isLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () => productService.getAll(),
    staleTime: 5 * 60 * 1000,
  });

  const listing = data.find((p) => p.type === "listing") || null;
  const addons = data.filter((p) => p.type === "addon" && p.appliesTo === "job");
  const creditBundles = data.filter((p) => p.type === "credit_bundle");
  const subscriptions = data.filter((p) => p.type === "subscription");

  return { products: data, listing, addons, creditBundles, subscriptions, isLoading };
}
