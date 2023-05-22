const play = require('play-dl');
const { createAudioPlayer, createAudioResource, joinVoiceChannel, NoSubscriberBehavior, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const { StreamType } = require('@discordjs/voice');

class Music {
    constructor() {
        this.isPlaying = {};
        this.queue = {};
        this.connection = {};
        this.dispatcher = {};
    }
    command(interaction) {
        interaction.reply({ content: `【播放音樂】/play url:音樂網址\n【暫停播放】/pause\n【恢復播放】/resume\n【跳過這首歌曲】/skip\n【查看歌曲隊列】/queue\n【刪除播放清單中的所有歌曲】/deleteplaylist id:id\n【查看機器人指令】/command\n【讓機器人離開語音頻道（會清空歌曲隊列）】/leave` });
    }
    isPlayList(url) {
        if (url.indexOf('&list') > -1 && url.indexOf('music.youtube') < 0) {
            return true;
        }

        return false;
    }

    async play(interaction) {
        const guildID = interaction.guildId;
        if (interaction.member.voice.channel === null) {
            interaction.reply({ content: '請先進入語音頻道', ephemeral: true });
            return;
        }

        this.connection[guildID] = joinVoiceChannel({
            channelId: interaction.member.voice.channel.id,
            guildId: guildID,
            adapterCreator: interaction.guild.voiceAdapterCreator
        });

        let musicURL = interaction.options.getString('url').trim();
        try {
            if (!this.queue[guildID]) {
                this.queue[guildID] = [];
            }

            let musicName = null;

            const isPlayList = this.isPlayList(musicURL);
            if (isPlayList) {

                // 取得播放清單的資訊
                const res = await play.playlist_info(musicURL);
                musicName = res.title;

                // 取得前 10 筆播放清單的列表歌曲
                const videoTitles = res.videos.map((v, i) => `[${i + 1}] ${v.title}`).slice(0, 10).join('\n');
                interaction.channel.send(`**加入播放清單：${musicName}**\nID 識別碼：[${res.id}]\n==========================\n${videoTitles}\n……以及其他 ${res.videos.length - 10} 首歌 `);

                // 依序將播放清單歌曲寫入隊列資料中
                res.videos.forEach(v => {
                    this.queue[guildID].push({
                        id: res.id,
                        name: v.title,
                        url: v.url
                    });
                });
            } else {
                // 取得影片資訊
                const res = await play.video_basic_info(musicURL);
                musicName = res.video_details.title;

                // 寫入隊列資料
                this.queue[guildID].push({
                    id: res.video_details.id,
                    name: musicName,
                    url: musicURL
                });

            }

            // 如果目前正在播放歌曲就加入隊列，反之則播放歌曲
            if (this.isPlaying[guildID]) {
                interaction.reply({ content: `歌曲加入隊列：${musicName}` });
            } else {
                this.isPlaying[guildID] = true;
                interaction.reply({ content: `🎵　播放音樂：${this.queue[guildID][0].name}` });
                this.playMusic(interaction, this.queue[guildID][0], true);
            }

        } catch (error) {
            interaction.reply({ content: '發生錯誤 :(' });
        }
    }
    playNextMusic(interaction) {

        const guildID = interaction.guildId;

        // 如果隊列中有歌曲則播放音樂
        if (this.queue[guildID].length > 0) {
            this.playMusic(interaction, this.queue[guildID][0], false);
        } else {
            this.isPlaying[guildID] = false;
        }
    }

    async playMusic(interaction, musicInfo, isReplied) {

        // 伺服器 ID
        const guildID = interaction.guildId;
        console.log(musicInfo)
        console.log("===============================")


        try {

            // 提示播放音樂
            if (!isReplied) {
                const content = `🎵　播放音樂：${musicInfo.name}`;
                interaction.channel.send(content);
            }

            // 播放音樂
            const stream = await play.stream(musicInfo.url);
            const resource = createAudioResource(stream.stream, {
                inputType: stream.type,
                inlineVolume: true
            });
            const player = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Play
                }
            });
            player.play(resource);

            this.connection[guildID].subscribe(player);
            this.dispatcher[guildID] = player;

            // 移除 queue 中目前播放的歌曲
            this.queue[guildID].shift();

            // 歌曲播放結束時的事件
            player.on('stateChange', (oldState, newState) => {
                if (
                    oldState.status === VoiceConnectionStatus.Ready &&
                    newState.status === VoiceConnectionStatus.Connecting
                ) {
                    connection.configureNetworking();
                }

            });
            player.on('idle', () => {
                console.log('Idle');
            })
            player.on('error', error => {
                console.log(error)
                // console.error(`Error: ${error.message} with resource ${error.resource}`);
                player.play(this.playNextMusic(interaction));
            });
        } catch (e) {
            console.log(e);
            interaction.channel.send('歌曲發生錯誤...');

            // 移除 queue 中目前播放的歌曲
            this.queue[guildID].shift();

            播放下一首歌
            this.playNextMusic(interaction);
        }

    }

}
module.exports = new Music();