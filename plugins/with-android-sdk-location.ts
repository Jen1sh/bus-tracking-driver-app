import { ConfigPlugin, withDangerousMod } from 'expo/config-plugins';
import fs from 'fs';
import os from 'os';
import path from 'path';

/**
 * Locates the Android SDK without assuming a machine.
 *
 * Order matters: the env vars win, because that is what CI (EAS) and Android Studio set, and they are
 * the only values that will be correct on a build machine that is not this laptop.
 */
const resolveSdkDir = (): string | null => {
  const localAppData = process.env.LOCALAPPDATA;

  const candidates = [
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT,
    // macOS default
    path.join(os.homedir(), 'Library', 'Android', 'sdk'),
    // Linux default
    path.join(os.homedir(), 'Android', 'Sdk'),
    // Windows default
    localAppData ? path.join(localAppData, 'Android', 'Sdk') : null,
  ].filter((dir): dir is string => typeof dir === 'string' && dir.length > 0);

  // Validated rather than trusted: a path that exists but has no `platforms/` is not an SDK, and
  // writing it would trade a clear "SDK location not found" for a far more confusing
  // "failed to find target android-36" much further into the build.
  return candidates.find(dir => fs.existsSync(path.join(dir, 'platforms'))) ?? null;
};

/**
 * Writes `android/local.properties` so Gradle can find the SDK.
 *
 * Why this exists: `local.properties` is the only SDK pointer that works in a non-interactive shell
 * (CI, a script, an IDE-spawned Gradle), because those never read `~/.zprofile`. But it is
 * gitignored *and* `npx expo prebuild --clean` deletes the entire `android/` directory, so writing it
 * by hand means it silently disappears and the next build fails with
 * "SDK location not found". Regenerating it from a config plugin makes it a build output instead of
 * something anyone has to remember to re-create.
 */
const withAndroidSdkLocation: ConfigPlugin = config =>
  withDangerousMod(config, [
    'android',
    async cfg => {
      const sdkDir = resolveSdkDir();

      if (!sdkDir) {
        // Deliberately silent. On a machine with no SDK — or one where the path is set to something
        // unexpected — Gradle's own error is more actionable than a guess made here. EAS sets
        // ANDROID_HOME, so remote builds resolve through the first candidate.
        return cfg;
      }

      const androidDir = cfg.modRequest.platformProjectRoot;
      const target = path.join(androidDir, 'local.properties');

      // Anything else already in the file is preserved. `flutter.sdk` and `ndk.dir` are the usual
      // residents, and silently dropping them would break whatever wrote them.
      const preserved = fs.existsSync(target)
        ? fs
            .readFileSync(target, 'utf8')
            .split(/\r?\n/)
            .filter(line => line.trim() && !/^\s*sdk\.dir\s*=/.test(line))
        : [];

      fs.mkdirSync(androidDir, { recursive: true });
      fs.writeFileSync(target, [...preserved, `sdk.dir=${sdkDir}`, ''].join(os.EOL));

      return cfg;
    },
  ]);

export default withAndroidSdkLocation;
