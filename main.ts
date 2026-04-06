//% color=#1E90FF weight=100 icon="\uf544"
//% block="AI"
namespace ai {

    // 동물 타입 목록
    const ANIMAL_TYPES = [
        "cow", "pig", "sheep", "chicken", "horse", "donkey",
        "rabbit", "wolf", "cat", "parrot", "turtle", "dolphin",
        "panda", "fox", "bee", "goat", "axolotl", "frog",
        "strider", "mooshroom", "squid", "bat"
    ]

    // 몬스터 타입 목록
    const MONSTER_TYPES = [
        "zombie", "skeleton", "creeper", "spider", "cave_spider",
        "enderman", "witch", "blaze", "ghast", "slime",
        "magma_cube", "husk", "stray", "drowned", "phantom",
        "pillager", "ravager", "vindicator", "warden", "hoglin"
    ]

    /**
     * 에이전트 앞에 있는 엔티티의 타입을 반환합니다.
     * 반환값: 플레이어 이름 / "동물" / "몬스터" / "아이템" / "없음"
     */
    //% blockId=ai_detect_entity_type_front
    //% block="에이전트 앞 엔티티 타입"
    //% weight=200
    export function detectEntityTypeFront(): string {
        // 1단계: 에이전트 앞에 엔티티가 있는지 확인
        let hasObstacle = agent.detect(AgentDetection.Obstacle, SixDirection.Forward)
        let hasBlock = agent.detect(AgentDetection.Block, SixDirection.Forward)

        if (!hasObstacle || hasBlock) {
            return "없음"
        }

        // 2단계: 플레이어 감지
        let playerResult = gameplay.executeCommand("testfor @a[r=2]")
        if (playerResult && playerResult.indexOf("Found") >= 0) {
            let parts = playerResult.split(": ")
            if (parts.length > 1) {
                return parts[parts.length - 1].trim()
            }
            return "Player"
        }

        // 3단계: 아이템(드롭 아이템) 감지
        let itemResult = gameplay.executeCommand("testfor @e[type=item,r=2]")
        if (itemResult && itemResult.indexOf("Found") >= 0) {
            return "아이템"
        }

        // 4단계: 동물 감지
        for (let i = 0; i < ANIMAL_TYPES.length; i++) {
            let animalResult = gameplay.executeCommand("testfor @e[type=" + ANIMAL_TYPES[i] + ",r=2]")
            if (animalResult && animalResult.indexOf("Found") >= 0) {
                return "동물"
            }
        }

        // 5단계: 몬스터 감지
        for (let i = 0; i < MONSTER_TYPES.length; i++) {
            let monsterResult = gameplay.executeCommand("testfor @e[type=" + MONSTER_TYPES[i] + ",r=2]")
            if (monsterResult && monsterResult.indexOf("Found") >= 0) {
                return "몬스터"
            }
        }

        return "알 수 없음"
    }

}
