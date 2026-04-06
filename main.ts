// @ts-nocheck
//% color=#1E90FF weight=100 icon="\uf544"
//% block="AI"
namespace ai {

    /**
     * 감지 기준 위치
     */
    export const enum ScanCenter {
        //% block="에이전트"
        Agent = 0,
        //% block="플레이어"
        Player = 1
    }

    /**
     * 기본 대상 선택자 (@a, @r, @p)
     */
    export const enum BasicTarget {
        //% block="@a 모든 플레이어"
        AllPlayers = 0,
        //% block="@r 임의 플레이어"
        RandomPlayer = 1,
        //% block="@p 가장 가까운 플레이어"
        NearestPlayer = 2
    }

    /**
     * 기본 대상 선택자를 반환합니다. (@a, @r, @p)
     * entityHasItem의 대상 입력으로 사용하거나, 다른 TargetSelector 블록으로 교체할 수 있습니다.
     */
    //% blockId=ai_basic_target
    //% block="$t"
    //% weight=175
    export function basicTarget(t: BasicTarget): TargetSelector {
        if (t == BasicTarget.RandomPlayer) return mobs.target(RANDOM_PLAYER)
        if (t == BasicTarget.NearestPlayer) return mobs.target(NEAREST_PLAYER)
        return mobs.target(ALL_PLAYERS)
    }

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
    /**
     * TargetSelector를 텍스트로 변환합니다.
     */
    //% blockId=ai_selector_to_text
    //% block="$sel 텍스트로 변환"
    //% weight=190
    export function selectorToText(sel: TargetSelector): string {
        return "" + sel
    }

    /**
     * 대상이 특정 아이템을 소지하고 있는지 확인합니다.
     * itemId 예시: "diamond", "iron_sword", "bow"
     */
    //% blockId=ai_entity_has_item
    //% block="$target 이(가) $item 소지"
    //% target.shadow=ai_basic_target
    //% item.shadow=minecraftItem
    //% item.defl=GRASS
    //% weight=185
    export function entityHasItem(target: TargetSelector, item: number): boolean {
        target.addRule("hasitem", "{item=" + item + "}")
        player.execute("setblock 1000 5 1000 air 0 destroy")
        player.execute("execute " + target + " ~~~ setblock 1000 5 1000 stone")
        return blocks.testForBlock(Block.Stone, world(1000, 5, 1000))
    }

    //% blockId=ai_scan_near
    //% block="$scanCenter 주변 반경 $radius 칸에서 $scanTarget 최대 $count 개 감지"
    //% radius.defl=3 radius.min=1 radius.max=10
    //% count.defl=1 count.min=1 count.max=10
    //% weight=200
    export function scanNear(scanCenter: ScanCenter, scanTarget: ScanTarget, radius: number, count: number): TargetSelector {
        let pos = scanCenter == ScanCenter.Player ? player.position() : agent.getPosition()
        let sel = mobs.near(mobs.target(ALL_ENTITIES), pos, radius)
        if (scanTarget == ScanTarget.Player) {
            sel = mobs.near(mobs.target(ALL_PLAYERS), pos, radius)
        } else if (scanTarget == ScanTarget.Monster) {
            sel.addRule("family", "monster")
        } else if (scanTarget == ScanTarget.Mob) {
            sel.addRule("family", "mob")
        }
        sel.addRule("c", "" + count)
        return sel
    }

}
