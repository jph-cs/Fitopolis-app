import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ActivityIndicator,
  View,
  StyleSheet,
} from 'react-native';
import {
  StreamApp,
  FlatFeed,
  Activity,
  StatusUpdateForm,
  LikeButton,
  UserBar,
} from 'expo-activity-feed';
import { getAuth } from 'firebase/auth';

const STREAM_API_KEY = '74be79rx6v5x';
const STREAM_APP_ID = '1201907';

// Adapted from: https://www.asapdevelopers.com/build-a-global-activity-feed-with-react-native-and-node-js/

export const navigationOptions = ({ navigation }) => ({
  title: 'HOME',
  headerTitleStyle: {
    fontWeight: '500',
    fontSize: 13,
  },
  headerLeft: () => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Profile')}
      style={{ paddingLeft: 15 }}
    >
    </TouchableOpacity>
  ),
});

function getUsernameFromEmail(userEmail) {
  return userEmail.split('@')[0];
}

const ActivityFeed = () => {
  // Initializing state
  const [globalToken, setGlobalToken] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get the current user and the user's email as the username for the activity feed
  let currUser = getAuth().currentUser;
  let username = getUsernameFromEmail(currUser.email);

  // URL path with query for the API function to generate a token for the user
  const getTokenURL =
    'https://us-central1-fitopolis-app.cloudfunctions.net/getTokens?';
  const query = `name=${username}`;

  // API function for tokens
  const callApi = async () => {
    const response = await fetch(getTokenURL + query);
    const userResponse = await response.json();
    return userResponse;
  };

  // Call the API function after the render of the screen
  useEffect(() => {
    callApi().then((response) => {
      setUserToken(response.userToken);
      setGlobalToken(response.globalToken);
      setLoading(false);
    });
  });

  // The header for each post
  const renderHeader = (props) => {
    const { activity } = props;
    const { actor } = activity;
    return (
      <View style={{ marginLeft: 10 }}>
        <UserBar username={actor.id} avatar={actor.data.profileImage} />
      </View>
    );
  };

  // The content (activity) render component
  const renderActivity = (props) => {
    return (
      <Activity
        Header={renderHeader(props)}
        {...props}
        Footer={
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <LikeButton reactionKind="heart" {...props} />
          </View>
        }
      />
    );
  };

  // Show a loading indicator while waiting for the stream to connect
  return loading ? (
    <ActivityIndicator />
  ) : (
    <SafeAreaView style={styles.container} forceInset={{ top: 'always' }}>
      <StreamApp
        apiKey={STREAM_API_KEY}
        appId={STREAM_APP_ID}
        token={globalToken}
      >
        <FlatFeed feedGroup="timeline" Activity={renderActivity} notify />
      </StreamApp>
      <StreamApp
        apiKey={STREAM_API_KEY}
        appId={STREAM_APP_ID}
        token={userToken}
      >
        <StatusUpdateForm feedGroup={'user'} />
      </StreamApp>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightblue',
    height: '100%',
  },
  title: {
    textAlign: 'center',
    fontSize: 25,
    fontWeight: '700',
  },
});

export default ActivityFeed;
