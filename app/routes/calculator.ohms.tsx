import {
  Button,
  Card,
  Combobox,
  Divider,
  Flex,
  Group,
  InputWrapper,
  NumberInput,
  Table,
  Text,
  useCombobox,
} from "@mantine/core";
import { getHotkeyHandler } from "@mantine/hooks";
import {
  Dispatch,
  forwardRef,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { BASE_INDEX, SI_PREFIXES } from "~/utils/consts";

export default function OhmsCalculator() {
  const [voltage, setVoltage] = useState<number | string>("");
  const [current, setCurrent] = useState<number | string>("");
  const [resistance, setResistance] = useState<number | string>("");
  const [voltPrefix, setVoltPrefix] = useState<(typeof SI_PREFIXES)[number]>(
    SI_PREFIXES[BASE_INDEX]
  );
  const [currentPrefix, setCurrentPrefix] = useState<
    (typeof SI_PREFIXES)[number]
  >(SI_PREFIXES[BASE_INDEX]);
  const [resistancePrefix, setResistancePrefix] = useState<
    (typeof SI_PREFIXES)[number]
  >(SI_PREFIXES[BASE_INDEX]);
  const [flashField, setFlashField] = useState<
    "voltage" | "current" | "resistance" | null
  >(null);
  const voltageRef = useRef<HTMLInputElement>(null);
  const currentRef = useRef<HTMLInputElement>(null);
  const resistanceRef = useRef<HTMLInputElement>(null);
  // only show the reset button if the input values are equal to the values in the inputValues state
  const [lastCalculatedValues, setLastCalculatedValues] = useState<{
    voltageInput: number;
    currentInput: number;
    resistanceInput: number;
    voltageCalculated: number;
    currentCalculated: number;
    resistanceCalculated: number;
  }>({
    voltageInput: 0,
    currentInput: 0,
    resistanceInput: 0,
    voltageCalculated: 0,
    currentCalculated: 0,
    resistanceCalculated: 0,
  });
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (flashField) {
      const timer = setTimeout(() => setFlashField(null), 1000);
      // Focus the newly calculated input
      if (flashField === "voltage") {
        voltageRef.current?.focus();
      } else if (flashField === "current") {
        currentRef.current?.focus();
      } else if (flashField === "resistance") {
        resistanceRef.current?.focus();
      }
      return () => clearTimeout(timer);
    }
  }, [flashField]);

  const getValue = (type: "voltage" | "current" | "resistance"): number => {
    switch (type) {
      case "voltage":
        return Number(voltage) * voltPrefix.value;
      case "current":
        return Number(current) * currentPrefix.value;
      case "resistance":
        return Number(resistance) * resistancePrefix.value;
    }
  };

  const calculate = () => {
    const currentVoltage = getValue("voltage");
    const currentCurrent = getValue("current");
    const currentResistance = getValue("resistance");

    // Reset if the input values are the same as the last calculated values
    if (
      lastCalculatedValues.voltageInput === currentVoltage &&
      lastCalculatedValues.currentInput === currentCurrent &&
      lastCalculatedValues.resistanceInput === currentResistance
    ) {
      setVoltage("");
      setCurrent("");
      setResistance("");
      setFlashField(null);
      setLastCalculatedValues({
        voltageInput: 0,
        currentInput: 0,
        resistanceInput: 0,
        voltageCalculated: 0,
        currentCalculated: 0,
        resistanceCalculated: 0,
      });
    } else {
      // check if there are two or more missing values when calculating
      let missingValues = 0;
      if (!voltage) {
        missingValues++;
      }
      if (!current) {
        missingValues++;
      }
      if (!resistance) {
        missingValues++;
      }
      if (missingValues > 1) {
        return;
      }

      let unitToCalculate: "voltage" | "current" | "resistance" | undefined;

      if (missingValues === 0) {
        // All values are present, so we need to see what the last calculated unit was to
        // determine the unit we want to calculate again

        if (lastCalculatedValues.voltageCalculated !== 0) {
          unitToCalculate = "voltage";
        } else if (lastCalculatedValues.currentCalculated !== 0) {
          unitToCalculate = "current";
        } else if (lastCalculatedValues.resistanceCalculated !== 0) {
          unitToCalculate = "resistance";
        } else {
          // No previous calculation, default to voltage
          unitToCalculate = "voltage";
        }
      }

      if (!voltage) {
        unitToCalculate = "voltage";
      } else if (!current) {
        unitToCalculate = "current";
      } else if (!resistance) {
        unitToCalculate = "resistance";
      }

      console.assert(
        unitToCalculate,
        "unitToCalculate is undefined (this should never happen)"
      );

      switch (unitToCalculate) {
        case "voltage":
          {
            const result = currentCurrent * currentResistance;
            setVoltage(result / voltPrefix.value);
            setLastCalculatedValues({
              voltageInput: result,
              currentInput: currentCurrent,
              resistanceInput: currentResistance,
              voltageCalculated: result,
              currentCalculated: 0,
              resistanceCalculated: 0,
            });
            setHistory([
              ...history,
              {
                voltageInput: currentVoltage,
                currentInput: currentCurrent,
                resistanceInput: currentResistance,
                voltageOutput: result,
                currentOutput: getValue("current"),
                resistanceOutput: getValue("resistance"),
                voltageSiIndex: SI_PREFIXES.findIndex(
                  (p) => p.value === voltPrefix.value
                ),
                currentSiIndex: SI_PREFIXES.findIndex(
                  (p) => p.value === currentPrefix.value
                ),
                resistanceSiIndex: SI_PREFIXES.findIndex(
                  (p) => p.value === resistancePrefix.value
                ),
              },
            ]);
            setFlashField("voltage");
          }
          break;
        case "current":
          {
            const result = currentVoltage / currentResistance;
            setCurrent(result / currentPrefix.value);
            setLastCalculatedValues({
              voltageInput: currentVoltage,
              currentInput: result,
              resistanceInput: currentResistance,
              voltageCalculated: 0,
              currentCalculated: result,
              resistanceCalculated: 0,
            });
            setHistory([
              ...history,
              {
                voltageInput: currentVoltage,
                currentInput: currentCurrent,
                resistanceInput: currentResistance,
                voltageOutput: getValue("voltage"),
                currentOutput: result,
                resistanceOutput: getValue("resistance"),
                voltageSiIndex: SI_PREFIXES.findIndex(
                  (p) => p.value === voltPrefix.value
                ),
                currentSiIndex: SI_PREFIXES.findIndex(
                  (p) => p.value === currentPrefix.value
                ),
                resistanceSiIndex: SI_PREFIXES.findIndex(
                  (p) => p.value === resistancePrefix.value
                ),
              },
            ]);
            setFlashField("current");
          }
          break;
        case "resistance":
          {
            const result = currentVoltage / currentCurrent;
            setResistance(result / resistancePrefix.value);
            setLastCalculatedValues({
              voltageInput: currentVoltage,
              currentInput: currentCurrent,
              resistanceInput: result,
              voltageCalculated: 0,
              currentCalculated: 0,
              resistanceCalculated: result,
            });
            setHistory([
              ...history,
              {
                voltageInput: currentVoltage,
                currentInput: currentCurrent,
                resistanceInput: currentResistance,
                voltageOutput: getValue("voltage"),
                currentOutput: result,
                resistanceOutput: getValue("resistance"),
                voltageSiIndex: SI_PREFIXES.findIndex(
                  (p) => p.value === voltPrefix.value
                ),
                currentSiIndex: SI_PREFIXES.findIndex(
                  (p) => p.value === currentPrefix.value
                ),
                resistanceSiIndex: SI_PREFIXES.findIndex(
                  (p) => p.value === resistancePrefix.value
                ),
              },
            ]);
            setFlashField("resistance");
          }
          break;
      }
    }
  };

  return (
    <>
      <style>{`
        @keyframes flash {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(37, 99, 235, 0);
          }
          50% {
            transform: scale(1.025);
            box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.3);
          }
        }
      `}</style>
      <Flex direction="column" gap="md">
        <Text>
          Calculate the values of a circuit using Ohm&apos;s Law: V = IR. Zeros
          will be considered as the unknown value. You can adjust the SI prefix
          by clicking the prefix in the input field.
          <br />
          <br />
          You can also use the hotkeys: k, m, u, n, p, space for the SI prefixes
          and enter to calculate.
        </Text>
        <Group grow justify="center">
          <InputWithPrefix
            ref={voltageRef}
            label="Voltage"
            value={Number(voltage)}
            onChange={setVoltage}
            prefix={voltPrefix}
            onPrefixChange={setVoltPrefix}
            unit="V"
            calculate={calculate}
            isFlash={flashField === "voltage"}
          />
          <InputWithPrefix
            ref={currentRef}
            label="Current"
            value={Number(current)}
            onChange={setCurrent}
            prefix={currentPrefix}
            onPrefixChange={setCurrentPrefix}
            unit="A"
            calculate={calculate}
            isFlash={flashField === "current"}
          />
          <InputWithPrefix
            ref={resistanceRef}
            label="Resistance"
            value={Number(resistance)}
            onChange={setResistance}
            prefix={resistancePrefix}
            onPrefixChange={setResistancePrefix}
            unit="Ω"
            calculate={calculate}
            isFlash={flashField === "resistance"}
          />
          {/* space so it is offset and lines up */}
          <InputWrapper label=" ">
            <Button
              onClick={calculate}
              fullWidth
              // if 2 or more values are missing, disable the button
              disabled={(() => {
                let missingValues = 0;
                if (!voltage) {
                  missingValues++;
                }
                if (!current) {
                  missingValues++;
                }
                if (!resistance) {
                  missingValues++;
                }
                return missingValues > 1;
              })()}
            >
              {voltage &&
              current &&
              resistance &&
              lastCalculatedValues.voltageInput === getValue("voltage") &&
              lastCalculatedValues.currentInput === getValue("current") &&
              lastCalculatedValues.resistanceInput === getValue("resistance")
                ? "Reset"
                : "Calculate"}
            </Button>
          </InputWrapper>
        </Group>
        <History history={history} />
      </Flex>
    </>
  );
}

const InputWithPrefix = forwardRef<
  HTMLInputElement,
  {
    label: string;
    value: number;
    onChange: (value: string | number) => void;
    prefix: (typeof SI_PREFIXES)[number];
    onPrefixChange: (prefix: (typeof SI_PREFIXES)[number]) => void;
    unit: string;
    calculate: () => void;
    isFlash?: boolean;
  }
>(function InputWithPrefix(
  { label, value, onChange, prefix, onPrefixChange, unit, calculate, isFlash },
  ref
) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  return (
    <InputWrapper label={label}>
      <NumberInput
        ref={ref}
        styles={{
          section: {
            width: combobox.dropdownOpened ? 100 : 30,
          },
          input: isFlash
            ? {
                animation: "flash 1s ease-in-out",
              }
            : undefined,
        }}
        onKeyDown={getHotkeyHandler([
          ["k", () => onPrefixChange(SI_PREFIXES[3])],
          ["space", () => onPrefixChange(SI_PREFIXES[BASE_INDEX])],
          // Resistors are very rarely in milli and more common in mega, so for resistance input, m means mega
          // Hopefully this isn't a weird UX issue but rather something helpful
          [
            "m",
            () =>
              onPrefixChange(
                label === "Resistance" ? SI_PREFIXES[2] : SI_PREFIXES[5]
              ),
          ],
          ["u", () => onPrefixChange(SI_PREFIXES[6])],
          ["n", () => onPrefixChange(SI_PREFIXES[7])],
          ["p", () => onPrefixChange(SI_PREFIXES[8])],
          ["enter", () => calculate()],
          [
            "escape",
            () => {
              onChange("");
            },
          ],
        ])}
        rightSection={
          <Combobox
            store={combobox}
            onOptionSubmit={(option) => {
              onPrefixChange(
                SI_PREFIXES.find((p) => p.prefix === option) ?? prefix
              );
              onChange(
                value *
                  (prefix.value /
                    (SI_PREFIXES.find((p) => p.prefix === option) ?? prefix)
                      .value)
              );
            }}
          >
            <Combobox.Target>
              <Text
                w="100%"
                onClick={() => combobox.toggleDropdown()}
                ta="right"
                style={{
                  position: "relative",
                  left: "-10px",
                  cursor: "pointer",
                  color: "var(--mantine-color-dimmed)",
                }}
              >
                {prefix.prefix}
                {unit}
              </Text>
            </Combobox.Target>

            <Combobox.Dropdown>
              <Combobox.Options>
                {SI_PREFIXES.map((p) => (
                  <Combobox.Option
                    p={1}
                    value={p.prefix}
                    key={p.prefix}
                    style={{
                      textAlign: "center",
                      backgroundColor:
                        p.prefix === prefix.prefix
                          ? "var(--mantine-color-gray-light)"
                          : "transparent",
                    }}
                  >
                    {p.prefix || ""}
                    {unit}{" "}
                    {p.value !== 1 ? (
                      <>
                        (10<sup>{Math.log10(p.value)}</sup>)
                      </>
                    ) : null}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </Combobox.Dropdown>
          </Combobox>
        }
        value={value || ""}
        onChange={(value) => onChange(value)}
      />
    </InputWrapper>
  );
});

type HistoryItem = {
  voltageInput: number;
  currentInput: number;
  resistanceInput: number;
  voltageOutput: number;
  currentOutput: number;
  resistanceOutput: number;
  voltageSiIndex: number;
  currentSiIndex: number;
  resistanceSiIndex: number;
};

function History({ history }: { history: HistoryItem[] }) {
  return (
    <>
      <Divider label="History" />
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Voltage</Table.Th>
            <Table.Th>Current</Table.Th>
            <Table.Th>Resistance</Table.Th>
            <Table.Th>Action</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {history.length > 0 ? (
            history.reverse().map((item) => (
              <Table.Tr key={item.voltageInput}>
                <Table.Td>
                  {(item.voltageInput || item.voltageOutput) /
                    SI_PREFIXES[item.voltageSiIndex].value}
                  {SI_PREFIXES[item.voltageSiIndex].prefix}V
                </Table.Td>
                <Table.Td>
                  {(item.currentInput || item.currentOutput) /
                    SI_PREFIXES[item.currentSiIndex].value}
                  {SI_PREFIXES[item.currentSiIndex].prefix}A
                </Table.Td>
                <Table.Td>
                  {(item.resistanceInput || item.resistanceOutput) /
                    SI_PREFIXES[item.resistanceSiIndex].value}
                  {SI_PREFIXES[item.resistanceSiIndex].prefix}Ω
                </Table.Td>
                <Table.Td>{/*  */}</Table.Td>
              </Table.Tr>
            ))
          ) : (
            <Table.Tr>
              <Table.Td colSpan={3} ta="center" my="md">
                No history
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </>
  );
}
