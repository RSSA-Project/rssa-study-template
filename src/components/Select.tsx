import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/16/solid";
import clsx from "clsx";
import { Fragment, useState } from "react";

const Select = ({
  onChange,
  children,
  placeholder = "",
  className,
}: {
  onChange: (value: string | boolean | number | null) => void;
  children: React.ReactNode[];
  placeholder?: string;
  className?: string;
}) => {
  const [selected, setSelected] = useState<string | boolean | number | null>(
    placeholder,
  );

  const handleChange = (value: string | boolean | number | null) => {
    setSelected(value);
    onChange(value);
  };

  return (
    <div className="w-81 mt-3">
      <Listbox value={selected} onChange={handleChange}>
        <div className="relative">
          <ListboxButton
            className={clsx(
              className,
              "p-3 w-full border border-amber-500",
              "text-left cursor-pointer",
              "shadow-md sm:text-sm rounded-md",
              "focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2",
              "focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-amber-500",
            )}
          >
            <span className="p-3 me-3 truncate">{selected}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDownIcon
                className="h-6 w-6 text-gray-600"
                aria-hidden="true"
              />
            </span>
          </ListboxButton>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ListboxOptions
              anchor="bottom"
              className={clsx(
                "absolute w-81 !max-h-63",
                "mt-1 overflow-auto rounded-md cursor-pointer",
                "bg-white text-base shadow-lg ring-1 ring-amber-500",
                "focus:outline-none sm:text-sm",
              )}
            >
              {placeholder && (
                <ListboxOption
                  value={placeholder}
                  className="hover:bg-amber-500"
                >
                  <div className={clsx("flex py-2 px-4")}>{placeholder}</div>
                </ListboxOption>
              )}
              {children.map((option, idx) => (
                <ListboxOption
                  key={idx}
                  value={option}
                  className="hover:bg-amber-500"
                >
                  {({ selected }) => (
                    <div
                      className={clsx(
                        "flex py-2 px-4",
                        selected ? "bg-amber-500" : "",
                      )}
                    >
                      {selected ? (
                        <span className="inset-y-0 left-0 flex items-center text-green-600 me-1">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                      <span
                        className={clsx(
                          selected ? "" : "ms-6",
                          `block truncate ${selected ? "font-medium" : "font-normal"}`,
                        )}
                      >
                        {option}
                      </span>
                    </div>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};
export default Select;
