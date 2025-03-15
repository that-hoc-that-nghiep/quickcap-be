import { NSFWType } from './nsfw';

export enum ReportType {
  VIOLENCE = 'violence',
  PORNOGRAPHY = 'pornography',
  SEXUAL_CONTENT = 'sexual_content',
  ADULT_ANIME = 'adult_anime',
}

export const ReportNSWF: Record<ReportType, NSFWType> = {
  [ReportType.VIOLENCE]: NSFWType.PORN,
  [ReportType.PORNOGRAPHY]: NSFWType.PORN,
  [ReportType.SEXUAL_CONTENT]: NSFWType.SEXY,
  [ReportType.ADULT_ANIME]: NSFWType.HENTAI,
};
