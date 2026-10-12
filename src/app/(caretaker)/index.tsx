import FatButton from '@/components/fatUI/fatButton';
import { supabase } from '@/lib/supabase';
import { LogOut } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CaretakerHome() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        setUser(user);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }
    getUser();
  }, []);
  

    return(
        <SafeAreaView>
            {loading && 
            <Text>
                Loading..
            </Text>
            }
            {!loading &&
                <Text>
                    Hello {user.user_metadata.full_name}
                </Text>
            }

            <FatButton
                text="Log out"
                icon={LogOut}
                type="secondary"
                size="small"
                onPress={() => supabase.auth.signOut()}
            />
        </SafeAreaView>
    )
}