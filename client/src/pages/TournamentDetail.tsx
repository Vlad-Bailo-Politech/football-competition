import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Trophy,
    Users,
    MapPin,
    ArrowLeft,
    User,
    Users2,
    Target,
} from "lucide-react";

const TournamentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTournament = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:5000/api/public/tournaments/${id}`
                );
                setTournament(res.data);
            } catch (err) {
                console.error("Помилка завантаження турніру:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTournament();
    }, [id]);

    if (loading) return <div className="text-center py-10">Завантаження...</div>;
    if (!tournament)
        return <div className="text-center py-10">Турнір не знайдено</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <Header />

            <main className="flex-1 py-8">
                <div className="container mx-auto px-4">
                    {/* Назад */}
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/tournaments")}
                        className="mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Повернутись до турнірів
                    </Button>

                    {/* Заголовок */}
                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div className="flex items-center space-x-4">
                            <div className="text-6xl">
                                <img
                                    src={
                                        tournament.logo
                                            ? `http://localhost:5000${tournament.logo}`
                                            : "http://localhost:5000/uploads/defaults/default-tournament.png"
                                    }
                                    alt={tournament.name}
                                    className="w-12 h-12 object-cover"
                                />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                    {tournament.name}
                                </h1>
                                <p className="text-lg text-gray-600 dark:text-gray-400">
                                    {tournament.description}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Картки з даними */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                        <Card>
                            <CardContent className="p-4 flex items-center space-x-2">
                                <Users className="w-5 h-5 text-football-green" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Команд
                                    </p>
                                    <p className="text-xl font-semibold">
                                        {tournament.teams?.length || 0}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4 flex items-center space-x-2">
                                <Trophy className="w-5 h-5 text-football-green" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Матчів
                                    </p>
                                    <p className="text-xl font-semibold">
                                        {tournament.matches?.length || 0}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4 flex items-center space-x-2">
                                <MapPin className="w-5 h-5 text-football-green" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Локація
                                    </p>
                                    <p className="text-xl font-semibold">{tournament.location}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabs */}
                    <Tabs defaultValue="table" className="space-y-6 mt-6">
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="table">Таблиця</TabsTrigger>
                            <TabsTrigger value="results">Результати</TabsTrigger>
                            <TabsTrigger value="chessboard">Шахівниця</TabsTrigger>
                            <TabsTrigger value="teams">Команди</TabsTrigger>
                            <TabsTrigger value="players">Гравці</TabsTrigger>
                        </TabsList>

                        {/* Таблиця */}
                        <TabsContent value="table">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Турнірна таблиця</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {tournament.standings ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Позиція</TableHead>
                                                    <TableHead>Команда</TableHead>
                                                    <TableHead className="text-center">І</TableHead>
                                                    <TableHead className="text-center">В</TableHead>
                                                    <TableHead className="text-center">Н</TableHead>
                                                    <TableHead className="text-center">П</TableHead>
                                                    <TableHead className="text-center">О</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {tournament.standings.map((row, i) => (
                                                    <TableRow key={i}>
                                                        <TableCell>{row.position}</TableCell>
                                                        <TableCell>{row.team?.name}</TableCell>
                                                        <TableCell className="text-center">{row.played}</TableCell>
                                                        <TableCell className="text-center">{row.wins}</TableCell>
                                                        <TableCell className="text-center">{row.draws}</TableCell>
                                                        <TableCell className="text-center">{row.losses}</TableCell>
                                                        <TableCell className="text-center">{row.points}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <p>Немає таблиці</p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Результати */}
                        <TabsContent value="results">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Останні результати</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {tournament.matches?.map((match) => (
                                        <div
                                            key={match._id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                                            // onClick={() => navigate(`/matches/${match._id}`)}
                                        >
                                            <div>
                                                <div className="font-medium">
                                                    {match.homeTeam?.name} vs {match.awayTeam?.name}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    {new Date(match.date).toLocaleDateString("uk-UA")}
                                                </div>
                                            </div>
                                            {match.status === "finished" && (
                                                <div className="text-xl font-bold text-football-green">
                                                    {match.score.home}:{match.score.away}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Шахівниця */}
                        <TabsContent value="chessboard">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Шахівниця результатів</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-40">Команда</TableHead>
                                                    {tournament.teams?.map((team) => (
                                                        <TableHead key={team._id} className="text-center w-20">
                                                            {team.name}
                                                        </TableHead>
                                                    ))}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {tournament.teams?.map((rowTeam) => (
                                                    <TableRow key={rowTeam._id}>
                                                        {/* Назва рядкової команди */}
                                                        <TableCell className="font-medium">{rowTeam.name}</TableCell>

                                                        {tournament.teams?.map((colTeam) => {
                                                            if (rowTeam._id === colTeam._id) {
                                                                return (
                                                                    <TableCell
                                                                        key={colTeam._id}
                                                                        className="text-center bg-gray-200 dark:bg-gray-700"
                                                                    >
                                                                        -
                                                                    </TableCell>
                                                                );
                                                            }

                                                            // знайти матч між rowTeam та colTeam
                                                            const match = tournament.matches?.find(
                                                                (m) =>
                                                                    (m.homeTeam?._id === rowTeam._id &&
                                                                        m.awayTeam?._id === colTeam._id) ||
                                                                    (m.homeTeam?._id === colTeam._id &&
                                                                        m.awayTeam?._id === rowTeam._id)
                                                            );

                                                            if (!match || match.status !== "finished") {
                                                                return (
                                                                    <TableCell
                                                                        key={colTeam._id}
                                                                        className="text-center text-gray-400"
                                                                    >
                                                                        ?
                                                                    </TableCell>
                                                                );
                                                            }

                                                            // визначаємо результат для rowTeam
                                                            const home = match.score.home;
                                                            const away = match.score.away;
                                                            let resultClass = "";
                                                            let resultText = `${home}:${away}`;

                                                            if (match.homeTeam?._id === rowTeam._id) {
                                                                if (home > away)
                                                                    resultClass =
                                                                        "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
                                                                else if (home < away)
                                                                    resultClass =
                                                                        "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
                                                                else
                                                                    resultClass =
                                                                        "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
                                                            } else {
                                                                if (away > home)
                                                                    resultClass =
                                                                        "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
                                                                else if (away < home)
                                                                    resultClass =
                                                                        "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
                                                                else
                                                                    resultClass =
                                                                        "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
                                                            }

                                                            return (
                                                                <TableCell
                                                                    key={colTeam._id}
                                                                    className={`text-center ${resultClass}`}
                                                                >
                                                                    {resultText}
                                                                </TableCell>
                                                            );
                                                        })}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Легенда */}
                                    <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                                        <p>
                                            <span className="inline-block w-4 h-4 bg-green-100 dark:bg-green-900 border mr-2"></span>
                                            Перемога
                                        </p>
                                        <p>
                                            <span className="inline-block w-4 h-4 bg-yellow-100 dark:bg-yellow-900 border mr-2"></span>
                                            Нічия
                                        </p>
                                        <p>
                                            <span className="inline-block w-4 h-4 bg-red-100 dark:bg-red-900 border mr-2"></span>
                                            Поразка
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Команди */}
                        <TabsContent value="teams">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {tournament.teams?.map((team) => (
                                    <Card
                                        key={team._id}
                                        className="cursor-pointer hover:shadow-lg transition-shadow"
                                        // onClick={() => navigate(`/teams/${team._id}`)}
                                    >
                                        <CardHeader>
                                            <CardTitle className="flex items-center space-x-2">
                                                <Users2 className="w-5 h-5 text-football-green" />
                                                <span>{team.name}</span>
                                            </CardTitle>
                                        </CardHeader>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        {/* Гравці */}
                        <TabsContent value="players">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Гравці</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {tournament.players?.length ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Гравець</TableHead>
                                                    <TableHead>Команда</TableHead>
                                                    {/* <TableHead>Позиція</TableHead>
                                                    <TableHead className="text-center">Голи</TableHead>
                                                    <TableHead className="text-center">Асисти</TableHead> */}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {tournament.players.map((player) => (
                                                    <TableRow
                                                        key={player._id}
                                                        className="cursor-pointer hover:bg-muted/50"
                                                    // onClick={() => navigate(`/participants/${player._id}`)}
                                                    >
                                                        <TableCell className="flex items-center space-x-2">
                                                            <User className="w-4 h-4 text-football-green" />
                                                            <span>{player.name}</span>
                                                        </TableCell>
                                                        <TableCell>{player.team?.name}</TableCell>
                                                        {/* <TableCell>{player.position}</TableCell>
                                                        <TableCell className="text-center font-semibold">
                                                            {player.goals}
                                                        </TableCell>
                                                        <TableCell className="text-center font-semibold">
                                                            {player.assists}
                                                        </TableCell> */}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <p>Немає гравців</p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default TournamentDetail;
