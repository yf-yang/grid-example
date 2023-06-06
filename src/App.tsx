import GridLayout, { Layout } from "react-grid-layout";
import "./App.css";
import { useRef, useState } from "react";
import * as _ from "lodash";

interface Option {
  type: string;
  h: number;
  w: number;
}
const options: Option[] = [
  {
    type: "A",
    h: 1,
    w: 1,
  },
  {
    type: "B",
    h: 2,
    w: 1,
  },
  { type: "C", h: 3, w: 2 },
];

export default function App() {
  const [items, setItems] = useState<Layout[]>([]);
  const [counter, setCounter] = useState(0);
  const [adding, setAdding] = useState<{ x: number; y: number } | undefined>();
  const draggingRef = useRef<Option | undefined>();

  const onAddItem = (x: number, y: number) => {
    setAdding({ x, y });
  };
  const onRemoveItem = (i: string) => {
    console.log("removing", i);
    setItems((prevItems) => {
      console.log(prevItems);
      const abc = prevItems
        .filter((item) => item.i !== i)
        .filter((item) => item.i !== "+");
      console.log(abc);
      return abc;
    });
  };

  const onMouseEnter = () => {
    console.log(items);
    let maxRow = -1;
    const occupiedPositions = new Set(
      items
        .map((item) => {
          const { h, w, x, y } = item;
          maxRow = y + h > maxRow ? y + h : maxRow;
          return _.range(h)
            .map((i) => _.range(w).map((j) => [i, j] as const))
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

    setItems((items) => [
      ...items,
      ...emptyPositions.map(([y, x], index) => ({
        x,
        y,
        h: 1,
        w: 1,
        i: "+",
      })),
    ]);
  };
  const onMouseLeave = () => {
    setItems((items) => items.filter((item) => item.i !== "+"));
  };
  return (
    <>
      <div
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        // style={{ height: "130px" }}
      >
        <GridLayout
          resizeHandles={[]}
          className="layout"
          preventCollision
          compactType={null}
          cols={12}
          rowHeight={30}
          width={1300}
          // onResizeStart={(_layout, item) => {
          //   console.log("onResizeStart");
          //   if (item.i.startsWith("+")) {
          //     return;
          //   }
          //   console.log("remove");
          //   setItems((items) => items.filter((item) => item.i !== "+"));
          // }}
          isDroppable={true}
          // onDragStart={(_layout, item) => {
          //   console.log("onDragStart");
          //   if (item.i === "+") {
          //     return;
          //   }
          //   setItems((items) => items.filter((item) => item.i !== "+"));
          // }}
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
            if (i === "+") {
              const { x, y } = item;
              return (
                <div key={`+${index}`} data-grid={item} className="addblock">
                  <span
                    className="text"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddItem(x, y);
                    }}
                  >
                    +
                  </span>
                </div>
              );
            }
            return (
              <div key={i} data-grid={item}>
                <span className="text">{i}</span>
                <button
                  className="remove"
                  style={removeStyle}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveItem(i);
                  }}
                >
                  x
                </button>
              </div>
            );
          })}
        </GridLayout>
      </div>
      {adding !== undefined ? (
        <>
          {/* {options.map((option) => (
            <div
              key={option.type}
              className="droppable-element"
              draggable={true}
              unselectable="on"
              // this is a hack for firefox
              // Firefox requires some kind of initialization
              // which we can do by adding this attribute
              // @see https://bugzilla.mozilla.org/show_bug.cgi?id=568313
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", "");
                draggingRef.current = option;
              }}
              onDragEnd={() => {
                setAdding(false);
                draggingRef.current = undefined;
              }}
            >
              {option.type}: {option.w}x{option.h}
            </div>
          ))} */}

          {options.map((option) => (
            <div>
              <button
                key={option.type}
                onClick={(e) => {
                  console.log("click");
                  e.stopPropagation();
                  setItems((prevItems) => [
                    ...prevItems,
                    {
                      x: adding.x,
                      y: adding.y,
                      h: option.h,
                      w: option.w,
                      i: `${option.type}${counter}`,
                      resizeHandles: [
                        "s",
                        "w",
                        "e",
                        "n",
                        "sw",
                        "nw",
                        "se",
                        "ne",
                      ],
                    },
                  ]);
                  setAdding(undefined);
                  setCounter((prevCounter) => prevCounter + 1);
                }}
              >
                {option.type}: {option.w}x{option.h}
              </button>
            </div>
          ))}
        </>
      ) : undefined}
    </>
  );
}
