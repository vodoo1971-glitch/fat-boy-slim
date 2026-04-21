"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Timer,
  Trophy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Medal,
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  Target,
  SkipBack,
  SkipForward,
  Undo2,
  HeartPulse,
  Activity,
  Footprints,
  Dumbbell,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

type DayKey = "Day1" | "Day2" | "Day3" | "Day4" | "Day5" | "Day6" | "Day7";

type Drill = {
  name: string;
  target: string;
  cue: string;
  details: string;
  why: string;
  videoQuery: string;
};

type DayPlan = {
  title: string;
  focus: string;
  drills: Drill[];
};

type Metric = {
  key: string;
  label: string;
  better: "lower" | "higher";
  unit?: string;
};

type DrillLogEntry = {
  done?: boolean;
  best?: string;
  notes?: string;
};

type DayLog = Record<string, DrillLogEntry>;
type LogData = Record<string, DayLog>;
type MetricWeekData = Record<string, string>;
type MetricData = Record<number, MetricWeekData>;

type TimerPreset = {
  label: string;
  work: number;
  rest: number;
  rounds: number;
};

const days: DayKey[] = ["Day1", "Day2", "Day3", "Day4", "Day5", "Day6", "Day7"];

const makeDrill = (
  name: string,
  target: string,
  cue: string,
  details: string,
  why: string,
  videoQuery: string
): Drill => ({ name, target, cue, details, why, videoQuery });

const phase1Plan: Record<DayKey, DayPlan> = {
  Day1: {
    title: "Full Body Strength A",
    focus: "Basic movement quality and rebuilding strength",
    drills: [
      makeDrill("Sit-to-Stand", "2 x 8-10", "Stand tall, control down.", "Sit on a chair, stand up without using momentum if possible, then sit back under control.", "Builds leg strength and independence for daily life.", "sit to stand exercise proper form"),
      makeDrill("Wall or Incline Push-Ups", "2 x 8-10", "Body straight, move slow.", "Use a wall, counter, or bench. Lower under control and press back without collapsing the trunk.", "Builds upper-body strength at a safe starting level.", "wall push up proper form"),
      makeDrill("Band or Supported Row", "2 x 10", "Pull elbows back, chest proud.", "Use a resistance band or support one hand on a chair while rowing with a dumbbell or kettlebell.", "Improves posture and pulling strength.", "band row exercise proper form"),
      makeDrill("Low Step-Ups", "2 x 8/leg", "Drive through full foot.", "Step onto a low step or stair, stand tall, then lower under control.", "Builds leg strength and balance.", "low step up exercise proper form"),
      makeDrill("Farmer Carry or March in Place", "2 x 30 sec", "Tall posture, steady breathing.", "Carry light weight at sides or march in place if no weight is available.", "Builds trunk strength and work capacity.", "farmer carry proper form"),
      makeDrill("Standing Calf Raises", "2 x 12", "Lift high, lower slow.", "Hold onto support if needed and raise heels under control.", "Supports walking tolerance and lower-leg strength.", "standing calf raise proper form"),
      makeDrill("Easy Walk", "10 min", "Conversational pace.", "Walk at an easy pace where you can still talk comfortably.", "Builds aerobic base without overdoing it.", "walking for beginners fitness"),
    ],
  },
  Day2: {
    title: "Walking + Mobility",
    focus: "Heart health, flexibility, and recovery",
    drills: [
      makeDrill("Brisk Walk", "20-30 min", "Slightly faster than easy pace.", "Walk with purpose but stay able to talk in short sentences.", "Improves heart health and supports fat loss.", "brisk walking for fitness beginners"),
      makeDrill("Hip Mobility", "5 min", "Move slow, no forcing.", "Use controlled hip circles, lunging hip opener variations, or gentle floor mobility.", "Improves comfort with walking and squatting.", "hip mobility routine beginners"),
      makeDrill("Hamstring Stretch", "2 rounds", "Gentle stretch, steady breathing.", "Use a seated or standing hamstring stretch without bouncing.", "Improves flexibility and reduces stiffness.", "hamstring stretch proper form"),
      makeDrill("Chest / Upper Back Mobility", "5 min", "Open chest, rotate upper back.", "Use wall stretches, doorway stretch, and controlled thoracic rotation.", "Improves posture and shoulder comfort.", "thoracic mobility beginner routine"),
      makeDrill("Ankle Mobility", "3-5 min", "Heel stays down.", "Use knee-over-toe ankle mobility against a wall or step.", "Improves walking comfort and squat motion.", "ankle mobility for beginners"),
      makeDrill("Breathing Cooldown", "2 min", "Slow inhale, slower exhale.", "Stand or lie down and take calm breaths to bring heart rate down.", "Supports recovery and stress control.", "box breathing exercise beginners"),
    ],
  },
  Day3: {
    title: "Full Body Strength B",
    focus: "Strength, posture, and core stability",
    drills: [
      makeDrill("Bodyweight Squat to Box", "2 x 8", "Sit back, stand tall.", "Use a chair or box as a depth guide and keep control both directions.", "Builds lower-body strength safely.", "box squat bodyweight proper form"),
      makeDrill("Seated or Standing Press", "2 x 8-10", "Brace and press smooth.", "Use light dumbbells, kettlebells, or a band. Press without arching your back.", "Builds shoulder and upper-body strength.", "seated dumbbell press proper form beginners"),
      makeDrill("Band Pull-Aparts or Row", "2 x 10-12", "Shoulders down, chest proud.", "Use a light band and pull apart or row with controlled tension.", "Improves posture and upper-back endurance.", "band pull apart proper form"),
      makeDrill("Glute Bridge", "2 x 10", "Drive hips up, squeeze glutes.", "Lie on your back with knees bent and lift hips without over-arching.", "Builds glute strength and helps back comfort.", "glute bridge proper form beginners"),
      makeDrill("Dead Bug", "2 x 8/side", "Move slow, keep back down.", "Extend opposite arm and leg while keeping the ribcage and back controlled.", "Builds core control and trunk stability.", "dead bug exercise proper form"),
      makeDrill("Side Plank from Knees or Standing Brace", "2 x 20 sec/side", "Stay long and breathe.", "Use an easier side plank variation or a standing anti-lean hold.", "Improves side-core stability.", "modified side plank beginners"),
      makeDrill("Easy Walk", "10 min", "Loose and easy.", "Take an easy walk to finish the session.", "Improves recovery and daily movement.", "walking for beginners fitness"),
    ],
  },
  Day4: {
    title: "Cardio Intervals",
    focus: "Heart conditioning without pounding joints",
    drills: [
      makeDrill("Warm-Up Walk", "5 min", "Easy pace.", "Start slow and let breathing rise gradually.", "Prepares the body for intervals.", "walking warm up beginners"),
      makeDrill("1:2 Walk Intervals", "8 rounds", "1 min brisk / 2 min easy.", "Alternate one minute of purposeful walking with two minutes of easier recovery.", "Builds cardio capacity safely.", "walking interval training beginners"),
      makeDrill("Cooldown Walk", "5 min", "Easy and relaxed.", "Let heart rate come down gradually.", "Improves recovery and keeps the session comfortable.", "walking cool down after cardio"),
      makeDrill("Gentle Lower Stretching", "5 min", "No forcing.", "Stretch calves, hamstrings, hips, and quads lightly.", "Reduces stiffness after cardio.", "lower body stretch routine beginners"),
    ],
  },
  Day5: {
    title: "Strength + Mobility",
    focus: "Light strength and range of motion",
    drills: [
      makeDrill("Sit-to-Stand", "2 x 10", "Smooth reps, no rush.", "Use a chair and stay controlled each rep.", "Builds practical leg strength.", "sit to stand exercise proper form"),
      makeDrill("Wall Push-Ups", "2 x 10", "Body straight.", "Use a wall or sturdy surface at a comfortable height.", "Builds pressing strength safely.", "wall push up proper form"),
      makeDrill("Band Row", "2 x 10", "Elbows back, squeeze shoulder blades.", "Use a light band and pull with control.", "Improves posture and upper-back strength.", "band row exercise proper form"),
      makeDrill("Supported Split Squat or Step-Up", "2 x 6/leg", "Use support and stay balanced.", "Hold onto something stable and keep the range small if needed.", "Builds single-leg strength and confidence.", "supported split squat beginners"),
      makeDrill("Glute Bridge", "2 x 10", "Lift and squeeze.", "Drive hips up under control and lower slowly.", "Builds glute strength and helps hip function.", "glute bridge proper form beginners"),
      makeDrill("Overhead Reach Mobility", "2 rounds", "Reach tall, ribs down.", "Use controlled shoulder and ribcage movement overhead.", "Improves upper-body mobility.", "shoulder mobility overhead reach"),
      makeDrill("Torso Rotation Mobility", "2 rounds", "Rotate gently.", "Move through the upper back rather than forcing the lower back.", "Improves rotational mobility and comfort.", "thoracic rotation mobility beginners"),
    ],
  },
  Day6: {
    title: "Longer Low-Intensity Cardio",
    focus: "Easy conditioning and calorie burn",
    drills: [
      makeDrill("Steady Walk or Low-Impact Cardio", "30-40 min", "Keep it conversational.", "Choose walking, bike, elliptical, or pool walking. Stay at a sustainable pace.", "Builds aerobic base and supports fat loss.", "low impact cardio for beginners overweight"),
      makeDrill("Optional Stretch", "5 min", "Relax and breathe.", "Add a short gentle stretch after cardio if you feel tight.", "Improves recovery and flexibility.", "stretch after walking beginners"),
    ],
  },
  Day7: {
    title: "Recovery",
    focus: "Reset and keep moving lightly",
    drills: [
      makeDrill("Easy Walk", "10-20 min", "Very easy pace.", "Move lightly without turning it into a workout.", "Supports recovery and habit-building.", "walking for recovery beginners"),
      makeDrill("Light Stretching", "10 min", "Gentle only.", "Use comfortable stretches for hips, legs, chest, and back.", "Improves mobility and reduces stiffness.", "full body stretching beginners"),
      makeDrill("Breathing / Relaxation", "5 min", "Slow and calm.", "Finish with a few minutes of relaxed breathing.", "Supports stress control and recovery.", "breathing exercises relaxation beginners"),
    ],
  },
};

const phase2Plan: Record<DayKey, DayPlan> = {
  Day1: {
    title: "Full Body Strength A+",
    focus: "Slightly higher volume and stronger movement patterns",
    drills: [
      makeDrill("Sit-to-Stand or Goblet Squat", "3 x 8-10", "Strong posture, controlled pace.", "Use bodyweight or a light kettlebell if ready. Sit back and stand tall.", "Builds lower-body strength and daily-life function.", "goblet squat kettlebell proper form"),
      makeDrill("Incline Push-Ups", "3 x 8-12", "Body straight, smooth reps.", "Use a counter, bench, or sturdy elevated surface.", "Builds upper-body strength progressively.", "incline push up proper form"),
      makeDrill("Band / DB Row", "3 x 10-12", "Pull elbows back, do not shrug.", "Use a resistance band or a supported dumbbell row.", "Builds posture and pulling strength.", "dumbbell row beginners proper form"),
      makeDrill("Step-Ups", "3 x 8/leg", "Drive through the working leg.", "Use a low step and keep every rep controlled.", "Builds leg strength, balance, and endurance.", "step up exercise proper form athlete"),
      makeDrill("Farmer Carry", "3 x 30-40 sec", "Tall chest, steady breathing.", "Carry light weights or march in place if needed.", "Builds trunk strength and work capacity.", "farmer carry proper form"),
      makeDrill("Calf Raises", "3 x 12-15", "Lift high, lower slow.", "Use support if needed.", "Improves lower-leg strength for walking and stairs.", "standing calf raise proper form"),
      makeDrill("Easy Walk", "10 min", "Relaxed pace.", "Walk easy to finish the session.", "Helps recovery and adds activity volume.", "walking for beginners fitness"),
    ],
  },
  Day2: {
    title: "Walking + Mobility",
    focus: "Longer aerobic work and joint mobility",
    drills: [
      makeDrill("Brisk Walk", "25-35 min", "Walk with purpose.", "Stay at an effort where talking is possible but breathing is elevated.", "Improves heart health and calorie burn.", "brisk walking for fitness beginners"),
      makeDrill("Mobility Flow", "10 min", "Move slow and controlled.", "Use hips, ankles, chest, and upper-back mobility drills.", "Improves movement quality and comfort.", "mobility flow beginners"),
    ],
  },
  Day3: {
    title: "Full Body Strength B+",
    focus: "More strength and trunk control",
    drills: [
      makeDrill("Goblet Squat to Box", "3 x 8", "Sit back, chest up.", "Use a chair or box target to keep depth consistent.", "Builds stronger lower-body movement pattern.", "goblet squat kettlebell proper form"),
      makeDrill("Seated / Standing Press", "3 x 8-10", "Brace and press smooth.", "Use light dumbbells, kettlebells, or a band.", "Builds shoulder and upper-body strength.", "seated dumbbell press proper form beginners"),
      makeDrill("Band Pull-Aparts or Row", "3 x 12", "Shoulders down, chest proud.", "Use a light band with clean reps.", "Improves posture and upper-back endurance.", "band pull apart proper form"),
      makeDrill("Glute Bridge", "3 x 12", "Drive hips up, squeeze glutes.", "Lift with control and lower slowly.", "Builds glute strength and hip support.", "glute bridge proper form beginners"),
      makeDrill("Dead Bug", "3 x 8/side", "Move slowly.", "Keep the ribcage controlled and low back quiet.", "Builds core control and coordination.", "dead bug exercise proper form"),
      makeDrill("Side Plank Variation", "3 x 20-30 sec/side", "Stay long and breathe.", "Use knees down or a standing anti-lean hold as needed.", "Builds side-core stability.", "modified side plank beginners"),
      makeDrill("Easy Walk", "10 min", "Easy and relaxed.", "Walk to finish and recover.", "Adds daily movement without stress.", "walking for beginners fitness"),
    ],
  },
  Day4: {
    title: "Cardio Intervals Progression",
    focus: "Slightly harder heart conditioning",
    drills: [
      makeDrill("Warm-Up Walk", "5 min", "Easy first.", "Start slow and let breathing rise gradually.", "Prepares the body for interval work.", "walking warm up beginners"),
      makeDrill("90:90 Walk Intervals", "8-10 rounds", "90 sec brisk / 90 sec easy.", "Alternate ninety seconds brisk with ninety seconds easy.", "Improves cardio capacity progressively.", "walking interval training beginners"),
      makeDrill("Cooldown Walk", "5 min", "Relax and lower breathing.", "Walk easy until breathing settles.", "Supports recovery after intervals.", "walking cool down after cardio"),
    ],
  },
  Day5: {
    title: "Strength + Mobility",
    focus: "Strength support and flexibility",
    drills: [
      makeDrill("Sit-to-Stand or Supported Split Squat", "3 x 8", "Use control and balance.", "Pick the version that feels challenging but safe.", "Builds practical lower-body strength.", "supported split squat beginners"),
      makeDrill("Incline Push-Ups", "3 x 10", "Smooth controlled reps.", "Use a height that lets you keep clean form.", "Progresses upper-body strength safely.", "incline push up proper form"),
      makeDrill("Band Row", "3 x 12", "Pull with posture.", "Do not shrug or yank the band.", "Builds back strength and posture.", "band row exercise proper form"),
      makeDrill("Hip Hinge / Light RDL", "3 x 10", "Push hips back.", "Use a light kettlebell or dumbbell and keep the back flat.", "Builds glutes and hamstrings.", "romanian deadlift beginners proper form"),
      makeDrill("Glute Bridge", "3 x 12", "Lift and squeeze.", "Pause briefly at the top.", "Builds glute strength and hip support.", "glute bridge proper form beginners"),
      makeDrill("Mobility Work", "8-10 min", "Move and breathe.", "Use gentle mobility for hips, chest, ankles, and upper back.", "Improves flexibility and recovery.", "mobility flow beginners"),
    ],
  },
  Day6: {
    title: "Longer Cardio",
    focus: "Base conditioning and weight-loss support",
    drills: [
      makeDrill("Steady Walk or Low-Impact Cardio", "35-45 min", "Keep it conversational.", "Choose walk, bike, elliptical, or pool walking. Stay sustainable.", "Improves endurance and supports fat loss.", "low impact cardio for beginners overweight"),
    ],
  },
  Day7: {
    title: "Recovery",
    focus: "Reset and prepare for the next week",
    drills: [
      makeDrill("Easy Walk", "10-20 min", "Very easy.", "Move lightly without turning it into exercise stress.", "Keeps activity going while recovering.", "walking for recovery beginners"),
      makeDrill("Stretch + Breathing", "10-15 min", "Relax and slow down.", "Use gentle stretches and finish with calm breathing.", "Improves flexibility and recovery.", "breathing exercises relaxation beginners"),
    ],
  },
};

const metrics: Metric[] = [
  { key: "weight", label: "Body Weight", better: "lower", unit: "lb" },
  { key: "waist", label: "Waist", better: "lower", unit: "in" },
  { key: "walk", label: "Longest Walk", better: "higher", unit: "min" },
  { key: "sitstand", label: "Sit-to-Stand Test", better: "higher", unit: "reps" },
  { key: "pushups", label: "Incline Push-Ups", better: "higher", unit: "reps" },
  { key: "plank", label: "Plank Hold", better: "higher", unit: "sec" },
  { key: "energy", label: "Energy Score", better: "higher", unit: "/10" },
];

const timerPresets: TimerPreset[] = [
  { label: "Walk Intervals", work: 60, rest: 120, rounds: 8 },
  { label: "Strength Rest", work: 45, rest: 60, rounds: 8 },
  { label: "Mobility Flow", work: 40, rest: 20, rounds: 10 },
];

function loadState<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveState<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function firstDayKey(): DayKey {
  return "Day1";
}

function videoSearchUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

function formatSeconds(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function suggestedTimerIndex(drillName: string): number | null {
  const name = drillName.toLowerCase();
  if (name.includes("interval")) return 0;
  if (
    name.includes("strength") ||
    name.includes("push-up") ||
    name.includes("push up") ||
    name.includes("row") ||
    name.includes("squat") ||
    name.includes("step") ||
    name.includes("bridge") ||
    name.includes("calf")
  ) {
    return 1;
  }
  if (
    name.includes("mobility") ||
    name.includes("stretch") ||
    name.includes("breathing") ||
    name.includes("flow")
  ) {
    return 2;
  }
  return null;
}

export default function FatBoySlimApp() {
  const [selectedDay, setSelectedDay] = useState<DayKey>(() =>
    loadState<DayKey>("fatboyslim_selectedTrainingDay", firstDayKey())
  );
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [weekNumber, setWeekNumber] = useState<number>(() =>
    loadState<number>("fatboyslim_weekNumber", 1)
  );
  const [logData, setLogData] = useState<LogData>(() =>
    loadState<LogData>("fatboyslim_trainingLog", {})
  );
  const [metricData, setMetricData] = useState<MetricData>(() =>
    loadState<MetricData>("fatboyslim_metricData", {})
  );
  const [athlete, setAthlete] = useState<string>(() =>
    loadState<string>("fatboyslim_athleteName", "Fat Boy Slim")
  );
  const [expandedDrills, setExpandedDrills] = useState<Record<string, boolean>>({});
  const [chartMetricKey, setChartMetricKey] = useState<string>("weight");
  const [timerPresetIndex, setTimerPresetIndex] = useState<number>(0);
  const [timerPhase, setTimerPhase] = useState<"work" | "rest">("work");
  const [timerRoundsLeft, setTimerRoundsLeft] = useState<number>(timerPresets[0].rounds);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(timerPresets[0].work);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [loadedTimerDrill, setLoadedTimerDrill] = useState<string>("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => saveState("fatboyslim_weekNumber", weekNumber), [weekNumber]);
  useEffect(() => saveState("fatboyslim_trainingLog", logData), [logData]);
  useEffect(() => saveState("fatboyslim_metricData", metricData), [metricData]);
  useEffect(() => saveState("fatboyslim_athleteName", athlete), [athlete]);
  useEffect(() => saveState("fatboyslim_selectedTrainingDay", selectedDay), [selectedDay]);

  const isPhase2 = weekNumber >= 5;
  const activePlan = isPhase2 ? phase2Plan : phase1Plan;
  const activePhaseLabel = isPhase2
    ? "Phase 2: Build Capacity + Progress"
    : "Phase 1: Beginner Reconditioning";

  const currentPreset = timerPresets[timerPresetIndex];
  const dayPlan = activePlan[selectedDay];
  const currentDrill = dayPlan.drills[currentExerciseIndex];
  const logKey = `week${weekNumber}-${selectedDay}`;
  const todayLog: DayLog = logData[logKey] || {};
  const currentDrillEntry: DrillLogEntry = currentDrill ? todayLog[currentDrill.name] || {} : {};

  useEffect(() => {
    setCurrentExerciseIndex(0);
    setExpandedDrills({});
    setLoadedTimerDrill("");
    setTimerRunning(false);
  }, [selectedDay, weekNumber]);

  useEffect(() => {
    setTimerPhase("work");
    setTimerRoundsLeft(currentPreset.rounds);
    setTimerSecondsLeft(currentPreset.work);
    setTimerRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [timerPresetIndex, currentPreset.rounds, currentPreset.work]);

  useEffect(() => {
    if (!timerRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimerSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;

        if (timerPhase === "work") return currentPreset.rest;
        if (timerRoundsLeft > 1) return currentPreset.work;

        setTimerRunning(false);
        return 0;
      });

      setTimerPhase((prevPhase) => {
        if (timerSecondsLeft > 1) return prevPhase;
        return prevPhase === "work" ? "rest" : "work";
      });

      if (timerSecondsLeft <= 1 && timerPhase === "rest") {
        setTimerRoundsLeft((prev) => (prev > 1 ? prev - 1 : 0));
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerRunning, timerPhase, timerRoundsLeft, timerSecondsLeft, currentPreset.work, currentPreset.rest]);

  const updateDrill = (name: string, field: keyof DrillLogEntry, value: string | boolean) => {
    setLogData((prev) => ({
      ...prev,
      [logKey]: {
        ...prev[logKey],
        [name]: {
          ...(prev[logKey]?.[name] || {}),
          [field]: value,
        },
      },
    }));
  };

  const updateMetric = (key: string, value: string) => {
    setMetricData((prev) => ({
      ...prev,
      [weekNumber]: {
        ...(prev[weekNumber] || {}),
        [key]: value,
      },
    }));
  };

  const toggleDrill = (name: string) => {
    setExpandedDrills((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const metricSummary = useMemo(() => {
    return metrics.map((m) => {
      const current = parseFloat(metricData?.[weekNumber]?.[m.key] ?? "");
      const prev = parseFloat(metricData?.[weekNumber - 1]?.[m.key] ?? "");
      let trend: number | null = null;
      let percent: number | null = null;
      if (!Number.isNaN(current) && !Number.isNaN(prev)) {
        trend = m.better === "lower" ? prev - current : current - prev;
        if (prev !== 0) {
          percent = m.better === "lower" ? ((prev - current) / prev) * 100 : ((current - prev) / prev) * 100;
        }
      }
      return { ...m, current, prev, trend, percent };
    });
  }, [metricData, weekNumber]);

  const personalRecords = useMemo(() => {
    const result: Record<string, number | null> = {};
    metrics.forEach((metric) => {
      const values = Object.keys(metricData)
        .map((wk) => Number(metricData[Number(wk)]?.[metric.key]))
        .filter((v) => !Number.isNaN(v));
      result[metric.key] = !values.length
        ? null
        : metric.better === "lower"
          ? Math.min(...values)
          : Math.max(...values);
    });
    return result;
  }, [metricData]);

  const completionPct = useMemo(() => {
    const complete = dayPlan.drills.filter((drill) => todayLog[drill.name]?.done).length;
    return Math.round((complete / dayPlan.drills.length) * 100);
  }, [dayPlan.drills, todayLog]);

  const selectedMetric = metrics.find((m) => m.key === chartMetricKey) || metrics[0];
  const currentWeekMetricRaw = metricData?.[weekNumber]?.[chartMetricKey];
  const currentWeekMetric =
    currentWeekMetricRaw !== undefined && currentWeekMetricRaw !== ""
      ? Number(currentWeekMetricRaw)
      : null;
  const chartPR = personalRecords[chartMetricKey];
  const isCurrentWeekPR = currentWeekMetric !== null && chartPR !== null && currentWeekMetric === chartPR;

  const chartData = useMemo(() => {
    return Object.keys(metricData)
      .map((wk) => {
        const week = Number(wk);
        const raw = metricData[week]?.[chartMetricKey];
        const value = raw !== undefined && raw !== "" ? Number(raw) : null;
        return { week: `W${week}`, weekNumber: week, value };
      })
      .filter((row) => row.value !== null && !Number.isNaN(row.value))
      .sort((a, b) => a.weekNumber - b.weekNumber);
  }, [metricData, chartMetricKey]);

  const topImprovement = metricSummary
    .filter((m) => m.percent !== null && !Number.isNaN(m.percent ?? NaN))
    .sort((a, b) => Math.abs((b.percent ?? 0)) - Math.abs((a.percent ?? 0)))[0];

  const loadDrillTimer = (drillName: string) => {
    const idx = suggestedTimerIndex(drillName);
    if (idx === null) return;
    setTimerPresetIndex(idx);
    setLoadedTimerDrill(drillName);
    setTimerRunning(false);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setLoadedTimerDrill("");
    setTimerPhase("work");
    setTimerRoundsLeft(currentPreset.rounds);
    setTimerSecondsLeft(currentPreset.work);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const advanceToNextTrainingDay = () => {
    const currentIndex = days.indexOf(selectedDay);
    const nextIndex = currentIndex === days.length - 1 ? 0 : currentIndex + 1;
    if (currentIndex === days.length - 1) {
      setWeekNumber((w) => w + 1);
    }
    setSelectedDay(days[nextIndex]);
    setCurrentExerciseIndex(0);
  };

  const goBackTrainingDay = () => {
    const currentIndex = days.indexOf(selectedDay);
    const previousIndex = currentIndex === 0 ? days.length - 1 : currentIndex - 1;
    if (currentIndex === 0) {
      setWeekNumber((w) => Math.max(1, w - 1));
    }
    setSelectedDay(days[previousIndex]);
    setCurrentExerciseIndex(0);
  };

  const restartCurrentDay = () => {
    setLogData((prev) => {
      const next = { ...prev };
      delete next[logKey];
      return next;
    });
    setCurrentExerciseIndex(0);
    setExpandedDrills({});
    setLoadedTimerDrill("");
    setTimerRunning(false);
  };

  const restartCurrentWeek = () => {
    setLogData((prev) => {
      const next: LogData = {};
      for (const [key, value] of Object.entries(prev)) {
        if (!key.startsWith(`week${weekNumber}-`)) {
          next[key] = value;
        }
      }
      return next;
    });
    setMetricData((prev) => {
      const next = { ...prev };
      delete next[weekNumber];
      return next;
    });
    setSelectedDay("Day1");
    setCurrentExerciseIndex(0);
    setExpandedDrills({});
    setLoadedTimerDrill("");
    setTimerRunning(false);
  };

  const goToDay1 = () => {
    setSelectedDay("Day1");
    setCurrentExerciseIndex(0);
    setExpandedDrills({});
    setLoadedTimerDrill("");
    setTimerRunning(false);
  };

  const goNextExercise = () => {
    if (currentDrill) updateDrill(currentDrill.name, "done", true);
    if (currentExerciseIndex === dayPlan.drills.length - 1) {
      advanceToNextTrainingDay();
      return;
    }
    setCurrentExerciseIndex((idx) => Math.min(dayPlan.drills.length - 1, idx + 1));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-md pb-24">
        <div className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur">
          <div className="p-4">
            <div className="rounded-3xl bg-slate-900 p-4 text-white shadow-lg">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-300">Fat Boy Slim</p>
                  <h1 className="text-2xl font-bold">{athlete}</h1>
                  <p className="mt-1 text-xs text-slate-300">{activePhaseLabel}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Current training day: {selectedDay.replace("Day", "Day ")}
                  </p>
                </div>
                <Badge className="rounded-full px-3 py-1 text-sm">Week {weekNumber}</Badge>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-2xl bg-white/10 p-3">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Target className="h-4 w-4" /> Completion
                  </div>
                  <div className="mt-1 text-xl font-bold">{completionPct}%</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <div className="flex items-center gap-2 text-slate-300">
                    <TrendingUp className="h-4 w-4" /> Top Trend
                  </div>
                  <div className="mt-1 text-sm font-semibold">
                    {topImprovement ? topImprovement.label : "Waiting for data"}
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="rounded-2xl bg-white text-slate-900"
                  onClick={goBackTrainingDay}
                >
                  <SkipBack className="mr-1 h-4 w-4" /> Back Day
                </Button>
                <Button
                  variant="outline"
                  className="rounded-2xl bg-white text-slate-900"
                  onClick={advanceToNextTrainingDay}
                >
                  <SkipForward className="mr-1 h-4 w-4" /> Advance Day
                </Button>
                <Button
                  variant="outline"
                  className="rounded-2xl bg-white text-slate-900"
                  onClick={restartCurrentDay}
                >
                  <Undo2 className="mr-1 h-4 w-4" /> Restart Day
                </Button>
                <Button
                  variant="outline"
                  className="rounded-2xl bg-white text-slate-900"
                  onClick={goToDay1}
                >
                  Day 1
                </Button>
              </div>

              <div className="mt-2">
                <Button
                  variant="outline"
                  className="w-full rounded-2xl bg-white text-slate-900"
                  onClick={restartCurrentWeek}
                >
                  <RotateCcw className="mr-1 h-4 w-4" /> Restart Week
                </Button>
              </div>

              <div className="mt-3 flex gap-2">
                <Input
                  value={athlete}
                  onChange={(e) => setAthlete(e.target.value)}
                  placeholder="Name"
                  className="rounded-2xl bg-white text-slate-900"
                />
                <Button
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() => setWeekNumber((w) => Math.max(1, w - 1))}
                >
                  -
                </Button>
                <Button className="rounded-2xl" onClick={() => setWeekNumber((w) => w + 1)}>
                  +
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <Tabs defaultValue="today" className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-2xl">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="plan">Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="mt-4 space-y-4">
              <Card className="rounded-3xl shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-xl">{dayPlan.title}</CardTitle>
                      <p className="mt-1 text-sm text-slate-600">{dayPlan.focus}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-100 p-3">
                      <HeartPulse className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span>Completed</span>
                      <span>{completionPct}%</span>
                    </div>
                    <Progress value={completionPct} />
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="mb-4 rounded-3xl border bg-slate-50 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Timer className="h-5 w-5" />
                      <div className="font-semibold">Loaded Timer</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-2xl bg-white p-3">
                        <div className="text-xs text-slate-500">Preset</div>
                        <div className="mt-1 text-sm font-semibold">{currentPreset.label}</div>
                      </div>
                      <div className="rounded-2xl bg-white p-3">
                        <div className="text-xs text-slate-500">Time</div>
                        <div className="mt-1 text-xl font-bold">{formatSeconds(timerSecondsLeft)}</div>
                      </div>
                      <div className="rounded-2xl bg-white p-3">
                        <div className="text-xs text-slate-500">For</div>
                        <div className="mt-1 text-sm font-semibold">{loadedTimerDrill || "Select a drill"}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button className="rounded-2xl" onClick={() => setTimerRunning((prev) => !prev)}>
                        {timerRunning ? <Pause className="mr-1 h-4 w-4" /> : <Play className="mr-1 h-4 w-4" />}
                        {timerRunning ? "Pause" : "Start"}
                      </Button>
                      <Button variant="outline" className="rounded-2xl" onClick={resetTimer}>
                        <RotateCcw className="mr-1 h-4 w-4" /> Reset
                      </Button>
                    </div>
                    <div className="mt-2 text-sm text-slate-500">
                      {currentPreset.work}s work / {currentPreset.rest}s rest for {currentPreset.rounds} rounds
                    </div>
                  </div>

                  <div className="mb-4 rounded-3xl border bg-white p-4">
                    <div className="mb-2 text-sm font-semibold text-slate-900">Today’s Exercise List</div>
                    <div className="space-y-2">
                      {dayPlan.drills.map((drill, idx) => {
                        const done = !!todayLog[drill.name]?.done;
                        return (
                          <div
                            key={drill.name}
                            className={`flex items-center justify-between rounded-2xl border px-3 py-2 ${
                              idx === currentExerciseIndex ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white"
                            }`}
                          >
                            <div>
                              <div className="text-sm font-medium text-slate-900">{idx + 1}. {drill.name}</div>
                              <div className="text-xs text-slate-500">{drill.target}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              {done ? <Badge className="rounded-full">Done</Badge> : <Badge variant="outline" className="rounded-full">Pending</Badge>}
                              <Button variant="outline" size="sm" className="rounded-2xl" onClick={() => setCurrentExerciseIndex(idx)}>
                                Open
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {currentDrill ? (
                    <Card className="rounded-3xl border-slate-200">
                      <CardContent className="p-4">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-500">#{currentExerciseIndex + 1}</span>
                              <h3 className="font-semibold">{currentDrill.name}</h3>
                            </div>
                            <p className="mt-1 text-sm text-slate-500">Target: {currentDrill.target}</p>
                          </div>
                          <Button
                            variant={currentDrillEntry.done ? "default" : "outline"}
                            size="sm"
                            className="rounded-full"
                            onClick={() => updateDrill(currentDrill.name, "done", !currentDrillEntry.done)}
                          >
                            <CheckCircle2 className="mr-1 h-4 w-4" /> {currentDrillEntry.done ? "Done" : "Mark"}
                          </Button>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                          <div className="font-medium text-slate-900">Quick cue</div>
                          <div className="mt-1">{currentDrill.cue}</div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {suggestedTimerIndex(currentDrill.name) !== null ? (
                            <Button variant="outline" className="rounded-2xl" size="sm" onClick={() => loadDrillTimer(currentDrill.name)}>
                              <Timer className="mr-1 h-4 w-4" /> Load timer
                            </Button>
                          ) : null}
                          <Button variant="outline" className="rounded-2xl" size="sm" onClick={() => toggleDrill(currentDrill.name)}>
                            {!!expandedDrills[currentDrill.name] ? <ChevronUp className="mr-1 h-4 w-4" /> : <ChevronDown className="mr-1 h-4 w-4" />}
                            {!!expandedDrills[currentDrill.name] ? "Less" : "How to do it"}
                          </Button>
                          <Button asChild variant="outline" className="rounded-2xl" size="sm">
                            <a href={videoSearchUrl(currentDrill.videoQuery)} target="_blank" rel="noreferrer">
                              <ExternalLink className="mr-1 h-4 w-4" /> Watch demo
                            </a>
                          </Button>
                        </div>

                        {!!expandedDrills[currentDrill.name] && (
                          <div className="mt-3 rounded-2xl border bg-white p-3 text-sm">
                            <div><span className="font-medium text-slate-900">How:</span> {currentDrill.details}</div>
                            <div className="mt-2"><span className="font-medium text-slate-900">Why:</span> {currentDrill.why}</div>
                          </div>
                        )}

                        <div className="mt-3 grid grid-cols-1 gap-2">
                          <Input
                            inputMode="decimal"
                            placeholder="Best result, minutes, weight used, or reps"
                            value={currentDrillEntry.best || ""}
                            onChange={(e) => updateDrill(currentDrill.name, "best", e.target.value)}
                            className="rounded-2xl"
                          />
                        </div>
                        <Textarea
                          placeholder="Notes"
                          value={currentDrillEntry.notes || ""}
                          onChange={(e) => updateDrill(currentDrill.name, "notes", e.target.value)}
                          className="mt-2 min-h-[70px] rounded-2xl"
                        />

                        <div className="mt-4 flex items-center justify-between gap-2">
                          <Button
                            variant="outline"
                            className="rounded-2xl"
                            onClick={() => setCurrentExerciseIndex((idx) => Math.max(0, idx - 1))}
                            disabled={currentExerciseIndex === 0}
                          >
                            Previous
                          </Button>
                          <div className="text-xs text-slate-500">Exercise {currentExerciseIndex + 1} of {dayPlan.drills.length}</div>
                          <Button className="rounded-2xl" onClick={goNextExercise}>
                            {currentExerciseIndex === dayPlan.drills.length - 1 ? "Finish Day" : "Next"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metrics" className="mt-4 space-y-4">
              <Card className="rounded-3xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" /> Progress Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl border bg-slate-50 p-4">
                      <div className="text-slate-500">Top Trend</div>
                      <div className="mt-1 font-semibold">{topImprovement ? topImprovement.label : "Waiting for data"}</div>
                    </div>
                    <div className="rounded-2xl border bg-slate-50 p-4">
                      <div className="text-slate-500">PR Status</div>
                      <div className="mt-1 font-semibold">{isCurrentWeekPR ? "New best this week" : "No new best yet"}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Weekly Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {metrics.map((metric) => {
                    const pr = personalRecords[metric.key];
                    const currentValue = metricData?.[weekNumber]?.[metric.key];
                    const isPR = currentValue !== undefined && currentValue !== "" && pr !== null && Number(currentValue) === pr;
                    return (
                      <div key={metric.key} className="rounded-2xl border p-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-slate-700">{metric.label}{metric.unit ? ` (${metric.unit})` : ""}</p>
                          {pr !== null ? (
                            <Badge variant="outline" className="rounded-full">
                              <Medal className="mr-1 h-3.5 w-3.5" /> Best {pr}
                            </Badge>
                          ) : null}
                        </div>
                        <Input inputMode="decimal" placeholder="Enter this week's value" value={currentValue || ""} onChange={(e) => updateMetric(metric.key, e.target.value)} className="rounded-2xl" />
                        {isPR ? <div className="mt-2 text-sm font-medium text-green-600">New personal best</div> : null}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="rounded-3xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Trend Graph</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                    {metrics.map((metric) => (
                      <Button key={metric.key} size="sm" variant={chartMetricKey === metric.key ? "default" : "outline"} className="rounded-2xl" onClick={() => setChartMetricKey(metric.key)}>
                        {metric.label}
                      </Button>
                    ))}
                  </div>
                  <div className="mb-3 flex items-center justify-between gap-3 text-sm text-slate-500">
                    <div>
                      Tracking: <span className="font-medium text-slate-900">{selectedMetric.label}</span>
                      {selectedMetric.better === "lower" ? " · lower is better" : " · higher is better"}
                    </div>
                    {chartPR !== null ? <Badge variant="outline" className="rounded-full">Best {chartPR}</Badge> : null}
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis />
                        <Tooltip />
                        <ReferenceLine y={chartPR ?? undefined} strokeDasharray="4 4" label={chartPR !== null ? "Best" : undefined} />
                        <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Weekly Snapshot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {metricSummary.map((m) => {
                    let text = "Add this week and last week to compare.";
                    if (m.trend !== null && !Number.isNaN(m.trend)) {
                      const direction = m.trend > 0 ? "Improved" : m.trend === 0 ? "No change" : "Down";
                      const absTrend = Math.abs(m.trend).toFixed(2);
                      const percentText = m.percent !== null ? ` · ${Math.abs(m.percent).toFixed(1)}%` : "";
                      text = direction === "No change" ? "No change" : `${direction} by ${absTrend}${m.unit ? ` ${m.unit}` : ""}${percentText}`;
                    }
                    return (
                      <div key={m.key} className="flex items-center justify-between rounded-2xl border p-3">
                        <div>
                          <p className="font-medium">{m.label}</p>
                          <p className="text-sm text-slate-500">{text}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {personalRecords[m.key] !== null ? <Badge variant="secondary" className="rounded-full">Best {personalRecords[m.key]}</Badge> : null}
                          <Badge variant="outline" className="rounded-full">{metricData?.[weekNumber]?.[m.key] || "--"}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="plan" className="mt-4 space-y-4">
              <Card className="rounded-3xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Footprints className="h-5 w-5" /> Weekly Plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {days.map((day) => (
                    <Card key={day} className="rounded-3xl border-slate-200">
                      <CardContent className="p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{day.replace("Day", "Day ")} · {activePlan[day].title}</h3>
                            <p className="text-sm text-slate-500">{activePlan[day].focus}</p>
                          </div>
                          {day === "Day1" || day === "Day3" || day === "Day5" ? (
                            <Badge className="rounded-full"><Dumbbell className="mr-1 h-3.5 w-3.5" /> Strength</Badge>
                          ) : day === "Day2" || day === "Day4" || day === "Day6" ? (
                            <Badge variant="secondary" className="rounded-full"><HeartPulse className="mr-1 h-3.5 w-3.5" /> Cardio</Badge>
                          ) : (
                            <Badge variant="outline" className="rounded-full"><Footprints className="mr-1 h-3.5 w-3.5" /> Recovery</Badge>
                          )}
                        </div>
                        <div className="space-y-2">
                          {activePlan[day].drills.map((drill) => (
                            <div key={drill.name} className="rounded-2xl bg-slate-50 p-3">
                              <div className="flex items-center justify-between gap-3">
                                <p className="font-medium">{drill.name}</p>
                                <span className="text-sm text-slate-500">{drill.target}</span>
                              </div>
                              <p className="mt-1 text-sm text-slate-600">{drill.cue}</p>
                              <div className="mt-2 text-sm text-slate-500">{drill.why}</div>
                              <div className="mt-2">
                                <a href={videoSearchUrl(drill.videoQuery)} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm font-medium text-blue-600 hover:underline">
                                  <ExternalLink className="mr-1 h-4 w-4" /> Demo search
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}