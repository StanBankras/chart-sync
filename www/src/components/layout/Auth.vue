<template>
  <div v-if="userName" id="login">
    <div class="join">
      <h2>Join an existing room</h2>
      <label for="roomId">Room code:</label>
      <input type="text" v-model="roomCode">
      <p class="error" v-if="noRoom">No room with this code</p>
      <button
        :disabled="!roomCode || roomCode === ''"
        @click="joinRoom(roomCode)"
        class="btn">Join room</button>
      <template v-if="Object.keys(rooms).length > 0">
        <h2>Continue in a room</h2>
        <div class="rooms">
          <div
            class="room"
            @click="joinRoom(key)"
            v-for="key in Object.keys(rooms)"
            :key="key">
            <p class="name">{{ rooms[key].name }}</p>
            <p>></p>
          </div>
        </div>
      </template>
    </div>
    <div class="new">
      <h1>Create a new room</h1>
      <div class="options">
        <div @click="createRoom(1)" class="charts">
          <div class="single">
            <div></div>
          </div>
          <h3>Single chart</h3>
        </div>
        <div @click="createRoom(2)" class="charts">
          <div class="double">
            <div></div>
            <div></div>
          </div>
          <h3>Double chart</h3>
        </div>
        <div @click="createRoom(4)" class="charts">
          <div class="quad">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <h3>Quad chart</h3>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="username">
    <h1>What is your nickname?</h1>
    <label for="username">My nickname is:</label>
    <input type="text" v-model="nickname">
    <button
      :disabled="!nickname || nickname === ''"
      @click="setUserName(nickname)"
      class="btn">Continue</button>
  </div>
</template>

<script>
import { v4 as uuidv4 } from 'uuid';
import Haikunator from 'haikunator';

const haikunator = new Haikunator({
  adjectives: [
    'Happy',
    'Cool',
    'Fantastic',
    'Good'
  ],
  nouns: [
    'trading',
    'trader',
    'charting',
    'charter'
  ],
  defaults: {
    tokenLength: 3,
    tokenChars: "1234567890"
  }
});

export default {
  computed: {
    userName() {
      return this.$store.getters.userName;
    },
    rooms() {
      return this.$store.getters.rooms;
    }
  },
  sockets: {
    joined(payload) {
      const id = payload.roomId;
      if(id === 'NO_ID') return this.noRoom = true;
      if(id === 'NO_ROOM_WITH_ID') return this.noRoom = true;
      this.$store.dispatch('setRoomId', payload).then(() => {
        if(this.$route.path === '/charts') return;
        this.$router.push('/charts');
      });
    } 
  },
  data() {
    return {
      nickname: undefined,
      roomCode: undefined,
      noRoom: false
    }
  },
  methods: {
    setUserName(name) {
      this.$store.commit('SET_USERNAME', name);
      localStorage.setItem('userName', name)
    },
    createRoom(chartCount) {
      const roomId = uuidv4();
      const body = JSON.stringify({
        room: {
          id: roomId,
          name: haikunator.haikunate()
        },
        chartCount
      });
      fetch(`${process.env.VUE_APP_API_HOSTNAME}/room/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body
      })
      .then(response => {
        if(response.ok) {
          this.joinRoom(roomId);
        } else if(response.status === 409) {
          this.createRoom(chartCount);
        }
      });
    },
    joinRoom(roomId) {
      this.$socket.emit('join', { roomId, username: this.userName });
    }
  }
}
</script>

<style lang="scss" scoped>
#login {
  display: grid;
  grid-template-columns: 400px 1fr;
  height: 100%;
  h1 {
    color: rgb(24, 158, 192);
  }
  .new {
    padding: 2rem;
    color: #787b86;
    display: flex;
    width: 100%;
    height: 100vh;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    .options {
      display: flex;
      align-items: flex-end;
      margin-top: 6rem;
      .charts {
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: center;
        margin-right: 5rem;
        cursor: pointer;
        &:last-child {
          margin-right: 0;
        }
        > div {
          &.double, &.quad {
            display: grid;
            grid-template-columns: 100px 100px;
            gap: 0.5rem;
          }
          div {
            width: 100px;
            height: 60px;
            background-color: #192133;
          }
        }
        h3 {
          margin-top: 1rem;
          text-align: center;
        }
        &:hover {
          > div div {
            background-color: rgb(24, 158, 192);
          }
        }
      }
    }
  }
  .join {
    padding: 2rem;
    color: #787b86;
    background-color: #192133;
    display: flex;
    flex-direction: column;
    button {
      margin-bottom: 2rem;
    }
  }
}

.username {
  width: 100vw;
  height: 100vh;
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #787b86;
  flex-direction: column;
  h1 {
    margin-bottom: 1rem;
  }
}

.rooms {
  .room {
    padding: 0.5rem 1rem;
    margin-bottom: 0.5rem;
    background-color: #1f283f;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    &:hover {
      background-color: #2a3655;
    }
  }
}

h2 {
  margin-bottom: 1rem;
}

.error {
  color: red;
  margin-bottom: 1rem;
}
</style>