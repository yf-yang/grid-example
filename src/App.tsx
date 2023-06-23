import GridLayout, { Layout } from "react-grid-layout";
import "./App.css";
import { useRef, useState } from "react";
import * as _ from "lodash";
import { Button, Dropdown } from "antd";
import { ItemType } from "antd/es/menu/hooks/useItems";

type Option = ItemType & { h: number; w: number };
const optionMap: Record<string, { h: number; w: number }> = {
  A: { h: 1, w: 1 },
  B: { h: 2, w: 1 },
  C: { h: 3, w: 2 },
};
const options: Option[] = Object.entries(optionMap).map(([k, { h, w }]) => ({
  key: k,
  label: `${k}: ${h} x ${w}`,
  h,
  w,
}));

function filterAddItem(layout: Layout[]): Layout[] {
  return layout.filter((item) => !item.i.startsWith("+"));
}

function fillWithAddItem(layout: Layout[]): Layout[] {
  let maxRow = -1;
  const occupiedPositions = new Set(
    layout
      .map((item) => {
        const { h, w, x, y } = item;
        maxRow = y + h > maxRow ? y + h : maxRow;
        return _.range(h)
          .map((i) => _.range(w).map((j) => [i, j]))
          .flat()
          .map(([i, j]) => (y + i) * 12 + x + j);
      })
      .flat()
  );
  maxRow = maxRow === -1 ? 3 : maxRow;
  const emptyPositions = _.range(maxRow)
    .map((i) => _.range(12).map((j) => [i, j] as const))
    .flat()
    .filter(([i, j]) => !occupiedPositions.has(i * 12 + j));

  return [
    ...layout,
    ...emptyPositions.map(([y, x], index) => ({
      x,
      y,
      h: 1,
      w: 1,
      i: "+",
      isDraggable: false,
      isResizable: false,
    })),
  ];
}

export default function App() {
  const [items, setItems] = useState<Layout[]>([]);
  const [counter, setCounter] = useState(0);
  const draggingRef = useRef<Option | undefined>();

  const onRemoveItem = (i: string) => {
    console.log("removing", i);
    setItems((prevItems) => {
      return filterAddItem(prevItems.filter((item) => item.i !== i));
    });
  };

  const onMouseEnter = () => {
    setItems(fillWithAddItem);
  };
  const onMouseLeave = () => {
    setItems((items) => filterAddItem(items));
  };
  return (
    <>
      <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        <GridLayout
          resizeHandles={["s", "w", "e", "n", "sw", "nw", "se", "ne"]}
          className="layout"
          preventCollision
          compactType={null}
          cols={12}
          rowHeight={30}
          width={1300}
          onLayoutChange={(layout) => {
            setItems((prev) =>
              // If prev has +, it suggests we added it in other callbacks, follow it.
              // It allows onResizeStop and OnDragStop add addItem blocks
              prev.some((item) => item.i.startsWith("+")) ? prev : layout
            );
          }}
          onResizeStart={() => {
            console.log("onResizeStart");
            setItems((items) => filterAddItem(items));
          }}
          onResizeStop={(layout) => {
            console.log("onResizeStop");
            setItems(fillWithAddItem(layout));
          }}
          isDroppable={true}
          onDragStart={() => {
            console.log("onDragStart");
            setItems((items) => filterAddItem(items));
          }}
          onDragStop={(layout) => {
            console.log("onDragStop");
            setItems(fillWithAddItem(layout));
          }}
          // onDragStop={(_layout, item, newItem) => {
          //   console.log("onDragStop");
          //   setItems((items) => [
          //     ...items.filter((i) => i.i !== item.i),
          //     newItem,
          //   ]);
          // }}
          // onDrop={(_layout, item) => {
          //   const { x, y, h, w } = item;
          //   if (!draggingRef.current) {
          //     throw new Error();
          //   }
          //   const { type } = draggingRef.current;
          //   setItems((prevItems) => [
          //     ...prevItems,
          //     {
          //       x,
          //       y,
          //       h,
          //       w,
          //       i: `${type}${counter}`,
          //       resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
          //     },
          //   ]);
          //   setCounter((prevCounter) => prevCounter + 1);
          // }}
          // onDropDragOver={() => {
          //   if (!draggingRef.current) {
          //     throw new Error();
          //   }
          //   const { w, h } = draggingRef.current;
          //   return { w, h };
          // }}
        >
          {items.map((item, index) => {
            const removeStyle = {
              position: "absolute",
              right: "2px",
              top: 0,
              cursor: "pointer",
            } as React.CSSProperties;
            const i = item.i;
            if (i.startsWith("+")) {
              return (
                <div key={`+${index}`} data-grid={item} className="addblock">
                  <Dropdown
                    menu={{
                      items: options,
                      onClick: ({ key }) => {
                        setItems((prevItems) => [
                          ...filterAddItem(prevItems),
                          {
                            x: item.x,
                            y: item.y,
                            h: optionMap[key].h,
                            w: optionMap[key].w,
                            i: `${key}${counter}`,
                          },
                        ]);
                        setCounter((prevCounter) => prevCounter + 1);
                      },
                    }}
                    placement="bottomLeft"
                    arrow
                  >
                    <Button className="text">+</Button>
                  </Dropdown>
                </div>
              );
            }
            return (
              <div key={i} data-grid={item}>
                <span className="text">{i}</span>
                <Button
                  className="remove"
                  style={removeStyle}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveItem(i);
                  }}
                >
                  ×
                </Button>
              </div>
            );
          })}
        </GridLayout>
      </div>
    </>
  );
}
