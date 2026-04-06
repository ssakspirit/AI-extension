// @ts-nocheck
//% color=#1E90FF weight=100 icon="\uf544"
//% block="AI"
namespace ai {

    // 스캔 결과를 저장하는 전역 변수
    let _detectedEntity = "없음"

    // onChat 리스너 등록 — 프로그램 시작 시 한 번만 실행됨
    player.onChat("__ai_player__", function () {
        _detectedEntity = "플레이어"
    })
    player.onChat("__ai_monster__", function () {
        _detectedEntity = "몬스터"
    })
    player.onChat("__ai_animal__", function () {
        _detectedEntity = "동물"
    })

    /**
     * 에이전트 앞에 블록이 있는지 확인합니다.
     */
    //% blockId=ai_detect_block_front
    //% block="에이전트 앞에 블록 감지"
    //% weight=200
    export function detectBlockFront(): boolean {
        return agent.detect(AgentDetection.Block, SixDirection.Forward)
    }

    /**
     * 에이전트 주변(반경 3칸)의 엔티티를 스캔합니다.
     * 스캔 후 '감지된 엔티티' 블록으로 결과를 읽으세요.
     * 우선순위: 플레이어 > 몬스터 > 동물
     */
    //% blockId=ai_scan_entity
    //% block="에이전트 주변 엔티티 스캔"
    //% weight=190
    export function scanEntity(): void {
        _detectedEntity = "없음"

        // 플레이어 감지
        player.execute("execute @a[r=3] ~~~ say __ai_player__")

        // 몬스터 감지 (플레이어가 없을 때만 의미 있음)
        const monsters = ["zombie", "skeleton", "creeper", "spider", "enderman", "witch", "husk", "stray", "drowned", "phantom"]
        for (let i = 0; i < monsters.length; i++) {
            player.execute("execute @e[type=" + monsters[i] + ",r=3] ~~~ say __ai_monster__")
        }

        // 동물 감지
        const animals = ["cow", "pig", "sheep", "chicken", "horse", "rabbit", "wolf", "cat"]
        for (let i = 0; i < animals.length; i++) {
            player.execute("execute @e[type=" + animals[i] + ",r=3] ~~~ say __ai_animal__")
        }

        // 명령어 결과가 onChat에 전달될 때까지 잠시 대기
        loops.pause(500)
    }

    /**
     * 마지막 스캔에서 감지된 엔티티 타입을 반환합니다.
     * 반환값: "플레이어" / "몬스터" / "동물" / "없음"
     */
    //% blockId=ai_last_detected_entity
    //% block="감지된 엔티티"
    //% weight=180
    export function lastDetectedEntity(): string {
        return _detectedEntity
    }

}
