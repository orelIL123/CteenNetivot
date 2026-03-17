import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Dimensions, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

const { width, height } = Dimensions.get('window');

export default function SplashScreenComponent({ onFinish }: { onFinish: () => void }) {
  // Animation values
  const bgFade = useRef(new Animated.Value(1)).current;

  // Ring pulses
  const ring1Scale = useRef(new Animated.Value(0.4)).current;
  const ring1Opacity = useRef(new Animated.Value(0)).current;
  const ring2Scale = useRef(new Animated.Value(0.4)).current;
  const ring2Opacity = useRef(new Animated.Value(0)).current;

  // Logo
  const logoScale = useRef(new Animated.Value(0.65)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  // Text
  const textTranslate = useRef(new Animated.Value(18)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  // Tagline
  const tagTranslate = useRef(new Animated.Value(12)).current;
  const tagOpacity = useRef(new Animated.Value(0)).current;

  // Gold bar
  const barWidth = useRef(new Animated.Value(0)).current;
  const barOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    // Staggered entrance sequence
    Animated.sequence([
      // Phase 1: rings bloom
      Animated.parallel([
        Animated.timing(ring1Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(ring1Scale, { toValue: 1, friction: 6, tension: 35, useNativeDriver: true }),
      ]),
      Animated.delay(80),
      Animated.parallel([
        Animated.timing(ring2Opacity, { toValue: 0.6, duration: 350, useNativeDriver: true }),
        Animated.spring(ring2Scale, { toValue: 1, friction: 6, tension: 30, useNativeDriver: true }),
      ]),

      // Phase 2: logo springs in
      Animated.delay(60),
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, friction: 7, tension: 50, useNativeDriver: true }),
      ]),

      // Phase 3: gold bar draws in
      Animated.delay(80),
      Animated.parallel([
        Animated.timing(barOpacity, { toValue: 1, duration: 200, useNativeDriver: false }),
        Animated.timing(barWidth, { toValue: 60, duration: 400, useNativeDriver: false }),
      ]),

      // Phase 4: text slides up
      Animated.delay(40),
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(textTranslate, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]),

      // Phase 5: tagline
      Animated.delay(60),
      Animated.parallel([
        Animated.timing(tagOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.timing(tagTranslate, { toValue: 0, duration: 280, useNativeDriver: true }),
      ]),

      // Hold
      Animated.delay(1000),

      // Fade out whole screen
      Animated.timing(bgFade, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start(onFinish);
  }, []);

  return (
    <Animated.View style={[styles.root, { opacity: bgFade }]}>
      {/* Deep navy background */}
      <View style={styles.bg} />

      {/* Outer decorative ring */}
      <Animated.View
        style={[
          styles.ring2,
          { opacity: ring2Opacity, transform: [{ scale: ring2Scale }] },
        ]}
      />

      {/* Inner ring */}
      <Animated.View
        style={[
          styles.ring1,
          { opacity: ring1Opacity, transform: [{ scale: ring1Scale }] },
        ]}
      />

      {/* Logo container */}
      <Animated.View
        style={[
          styles.logoWrap,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Text block below logo */}
      <View style={styles.textBlock}>
        {/* Gold separator bar */}
        <Animated.View
          style={[
            styles.goldBar,
            {
              width: barWidth,
              opacity: barOpacity,
            },
          ]}
        />

        {/* Brand name */}
        <Animated.Text
          style={[
            styles.brandName,
            { opacity: textOpacity, transform: [{ translateY: textTranslate }] },
          ]}
        >
          חב"ד לנוער נתיבות
        </Animated.Text>

        {/* Tagline */}
        <Animated.Text
          style={[
            styles.tagline,
            { opacity: tagOpacity, transform: [{ translateY: tagTranslate }] },
          ]}
        >
          CTeen Netivot
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const RING_SIZE = width * 0.72;
const LOGO_SIZE = width * 0.36;

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#141928', // COLORS.navy
  },

  // Rings
  ring2: {
    position: 'absolute',
    width: RING_SIZE + 80,
    height: RING_SIZE + 80,
    borderRadius: (RING_SIZE + 80) / 2,
    borderWidth: 1,
    borderColor: 'rgba(212,165,74,0.12)',
    backgroundColor: 'rgba(212,165,74,0.04)',
  },
  ring1: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 1.5,
    borderColor: 'rgba(212,165,74,0.25)',
    backgroundColor: 'rgba(212,165,74,0.07)',
  },

  // Logo
  logoWrap: {
    width: LOGO_SIZE + 24,
    height: LOGO_SIZE + 24,
    borderRadius: (LOGO_SIZE + 24) * 0.28,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D4A54A', // COLORS.gold
    // gold glow
    shadowColor: '#D4A54A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 16,
    marginBottom: 36,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE * 0.22,
  },

  // Text
  textBlock: {
    position: 'absolute',
    bottom: height * 0.18,
    alignItems: 'center',
    gap: 10,
  },
  goldBar: {
    height: 2,
    backgroundColor: '#D4A54A',
    borderRadius: 1,
    marginBottom: 4,
  },
  brandName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F5F0E8',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 13,
    fontWeight: '500',
    color: '#D4A54A',
    letterSpacing: 1.4,
    textAlign: 'center',
  },
});
