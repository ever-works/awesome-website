import { fetchItems, getPagePath } from "@/lib/content";
import Link from 'next/link';
import Item from "./items/item";

export const revalidate = 60;

export default async function Home() {
  const items = await fetchItems();

  return (
    <div className='container mx-auto p-8'>
      <h1 className='text-2xl font-extrabold'>Items</h1>

      <div className='py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5'>
        {items.map(item => (
          <Link prefetch={false} href={getPagePath(item.slug)} key={item.slug}>
            <Item {...item} />
          </Link>
        ))}
      </div>
    </div>
  );
}
