// @ts-nocheck
//% color=#1E90FF weight=100 icon="\uf544"
//% block="AI"
namespace ai {

    /**
     * 감지할 대상 종류
     */
    export const enum ScanTarget {
        //% block="플레이어"
        Player = 0,
        //% block="몬스터"
        Monster = 1,
        //% block="몹"
        Mob = 2,
        //% block="전체"
        All = 3
    }

    /**
     * 에이전트 주변 반경 N칸 안의 엔티티 이름 목록을 반환합니다.
     * 에이전트 자신은 제외됩니다.
     * 반환값 예시: "lees", "lees, Zombie", "없음"
     */
    //% blockId=ai_scan_near_agent
    //% block="에이전트 주변 반경 $radius 칸에서 $scanTarget 감지"
    //% radius.defl=3 radius.min=1 radius.max=10
    //% weight=200
    export function scanNearAgent(scanTarget: ScanTarget, radius: number): string {
        let sel = mobs.near(mobs.target(ALL_ENTITIES), agent.getPosition(), radius)
        if (scanTarget == ScanTarget.Player) {
            sel = mobs.near(mobs.target(ALL_PLAYERS), agent.getPosition(), radius)
        } else if (scanTarget == ScanTarget.Monster) {
            sel.addRule("family", "monster")
        } else if (scanTarget == ScanTarget.Mob) {
            sel.addRule("family", "mob")
        }
        sel.addRule("c", "10")
        let raw = "" + sel
        let parts = raw.split(", ")
        let results: string[] = []
        for (let i = 0; i < parts.length; i++) {
            if (parts[i].indexOf(".Agent") < 0) {
                results.push(parts[i])
            }
        }
        if (results.length == 0) return "없음"
        return results.join(", ")
    }

}
