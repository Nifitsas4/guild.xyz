import {
  Circle,
  FormLabel,
  HStack,
  Icon,
  IconButton,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react"
import { useAccessedGuildPoints } from "components/[guild]/AccessHub/hooks/useAccessedGuildPoints"
import OptionImage from "components/common/StyledSelect/components/CustomSelectOption/components/OptionImage"
import useTokenData from "hooks/useTokenData"
import { ArrowRight, Lock, LockOpen } from "phosphor-react"
import { useEffect, useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import Star from "static/icons/star.svg"
import Token from "static/icons/token.svg"
import { AddTokenFormType } from "../AddTokenPanel"
import ConversionNumberInput from "./ConversionNumberInput"

const ConversionInput = ({ defaultValue }: { defaultValue?: string }) => {
  const { control, setValue } = useFormContext<AddTokenFormType>()

  const [conversionLocked, setConversionLocked] = useState(false)
  const [conversionAmounts, setConversionAmounts] = useState([
    "1",
    defaultValue || "1",
  ])
  const [conversionRate, setConversionRate] = useState(1.0)

  const pointsPlatforms = useAccessedGuildPoints()

  const pointsPlatformId = useWatch({ name: "data.guildPlatformId", control })
  const imageUrl = useWatch({ name: `imageUrl`, control })
  const chain = useWatch({ name: `chain`, control })
  const address = useWatch({ name: `tokenAddress`, control })

  const selectedPointsPlatform = pointsPlatforms.find(
    (gp) => gp.id === pointsPlatformId
  )
  const {
    data: { logoURI: tokenLogo },
  } = useTokenData(chain, address)

  useEffect(() => {
    if (conversionLocked) return
    const convRate = Number(conversionAmounts[1]) / Number(conversionAmounts[0])
    setValue("multiplier", convRate)
  }, [conversionAmounts, setValue, conversionLocked])

  const toggleConversionLock = () => {
    if (conversionLocked) {
      setConversionLocked(false)
      setConversionAmounts([conversionAmounts[0], calculatePreview()])
    } else {
      setConversionRate(Number(conversionAmounts[1]) / Number(conversionAmounts[0]))
      setConversionLocked(true)
    }
  }

  const calculatePreview = () =>
    parseFloat((Number(conversionAmounts[0]) * conversionRate).toFixed(6)).toString()

  return (
    <>
      <HStack justifyContent={"space-between"}>
        <FormLabel>Conversion</FormLabel>
        <IconButton
          opacity={conversionLocked ? 1 : 0.5}
          icon={conversionLocked ? <Lock /> : <LockOpen />}
          size={"xs"}
          rounded={"full"}
          variant={"ghost"}
          aria-label="Lock/unlock conversion"
          onClick={toggleConversionLock}
        />
      </HStack>

      <HStack w={"full"}>
        <InputGroup>
          <InputLeftElement>
            {selectedPointsPlatform?.platformGuildData?.imageUrl ? (
              <OptionImage
                img={selectedPointsPlatform?.platformGuildData?.imageUrl}
                alt={
                  selectedPointsPlatform?.platformGuildData?.name ??
                  "Point type image"
                }
              />
            ) : (
              <Icon as={Star} />
            )}
          </InputLeftElement>

          <ConversionNumberInput
            value={conversionAmounts[0]}
            setValue={(val) => setConversionAmounts([val, conversionAmounts[1]])}
          />
        </InputGroup>

        <Circle background={"whiteAlpha.200"} p="1">
          <ArrowRight size={12} color="grayText" />
        </Circle>

        <InputGroup>
          <InputLeftElement>
            {tokenLogo || imageUrl ? (
              <OptionImage img={tokenLogo ?? imageUrl} alt={chain} />
            ) : (
              <Token />
            )}
          </InputLeftElement>

          <ConversionNumberInput
            value={conversionLocked ? calculatePreview() : conversionAmounts[1]}
            setValue={
              conversionLocked
                ? () => {}
                : (val) => setConversionAmounts([conversionAmounts[0], val])
            }
            isReadOnly={conversionLocked}
          />
        </InputGroup>
      </HStack>
    </>
  )
}

export default ConversionInput
