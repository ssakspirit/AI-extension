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

    function buildSelector(scanTarget: ScanTarget, pos: Position, radius: number): TargetSelector {
        if (scanTarget == ScanTarget.Player) {
            return mobs.near(mobs.target(ALL_PLAYERS), pos, radius)
        }
        let sel = mobs.near(mobs.target(ALL_ENTITIES), pos, radius)
        if (scanTarget == ScanTarget.Monster) {
            sel.addRule("family", "monster")
        } else if (scanTarget == ScanTarget.Mob) {
            sel.addRule("family", "mob")
        }
        return sel
    }

    /**
     * 에이전트 주변에서 엔티티를 감지합니다.
     */
    //% blockId=ai_scan_near_agent
    //% block="에이전트 주변 반경 $radius 칸에서 $scanTarget 감지"
    //% radius.defl=3 radius.min=1 radius.max=10
    //% weight=200
    export function scanNearAgent(scanTarget: ScanTarget, radius: number): string {
        let result = buildSelector(scanTarget, agent.getPosition(), radius)
        return "" + result
    }

    /**
     * 특정 좌표 주변에서 엔티티를 감지합니다.
     */
    //% blockId=ai_scan_near_position
    //% block="좌표 $pos 주변 반경 $radius 칸에서 $scanTarget 감지"
    //% pos.shadow=minecraftCreateWorldPosition
    //% radius.defl=3 radius.min=1 radius.max=10
    //% weight=190
    export function scanNearPosition(scanTarget: ScanTarget, pos: Position, radius: number): string {
        let result = buildSelector(scanTarget, pos, radius)
        return "" + result
    }

}
