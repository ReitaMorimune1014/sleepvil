// ポイント(成功日数)に関するパラメータ(docs/REQUIREMENTS.md 第4章)

/** 目標時刻からこの分数以内(前後とも)なら「時間どおり」とみなす */
export const ON_TIME_WINDOW_MINUTES = 15;

/** 時間どおりの成功で加算する日数 */
export const ON_TIME_POINTS = 1;

/** それ以外の成功で加算する日数(早すぎる起床も含む) */
export const OTHER_SUCCESS_POINTS = 0.5;
