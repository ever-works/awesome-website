'use client'

import { ItemData } from "@/lib/content";
import { Card, CardHeader, CardBody, Divider, Image } from "@heroui/react";

type ItemProps = ItemData;

export default function Item(props: ItemProps) {
  return (
    <Card className="w-full">
      <CardHeader className="flex gap-3">
        <Image
          alt="heroui logo"
          height={40}
          radius="sm"
          src="https://avatars.githubusercontent.com/u/86160567?s=200&v=4"
          width={40}
        />
        <div className="flex flex-col">
          <p className="text-md">{ props.name }</p>
          <p className="text-small text-default-500">{ props.category }</p>
        </div>
      </CardHeader>
      <Divider />
      <CardBody>
        <p className="line-clamp-3">{ props.description }</p>
      </CardBody>
      <Divider />
    </Card>
  );
}
