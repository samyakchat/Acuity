import { SafeAreaView } from "react-native-safe-area-context"
import { checkAp } from "./engine"
import FatButton from "@/components/fatUI/fatButton"
import {Text} from 'react-native'
import { useState } from "react"
import { useTheme } from "@/components/fatUI/theme"
import { router } from "expo-router"


export default function Idk() {
    const theme = useTheme()

    const [passedApt, setPassedApt] = useState(false)
    async function handlepress() {
        setPassedApt(await checkAp())
    }
    return (
        <SafeAreaView>
            <Text style={{color: theme.text}}>Hello!</Text>
            <FatButton
                text="pressme"
                size="small"
                type="secondary"
                onPress={handlepress}
            
            />
            <Text style={{color: theme.text}}>{passedApt ? "passedaptitude stage" : "nopenope"}</Text>
            {!passedApt && (
                <FatButton
                    text="takeaptitude"
                    size="small"
                    type="primary"
                    onPress={() => {
                        router.push({
                            pathname: '/(patient)/gamePages/gametemp', 
                            params: {gameID: "welcome"} 
                        }) 
                    }}
                />
            )}
        </SafeAreaView>
    );
}