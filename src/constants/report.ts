import { NSFWType } from './nsfw';

export enum ReportType {
  VIOLENCE = 'Violence',
  PORNOGRAPHY = 'Pornography',
  SEXUAL_CONTENT = 'Sexual Content',
  ADULT_ANIME = 'Adult Anime',
}

export const ReportNSWF: Record<ReportType, NSFWType> = {
  [ReportType.VIOLENCE]: NSFWType.VIOLENCE,
  [ReportType.PORNOGRAPHY]: NSFWType.PORN,
  [ReportType.SEXUAL_CONTENT]: NSFWType.SEXY,
  [ReportType.ADULT_ANIME]: NSFWType.HENTAI,
};
