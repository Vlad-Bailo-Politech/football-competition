
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, CreditCard, Users, Trophy, Clock } from 'lucide-react';

const Contacts = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Контакти
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Зв'яжіться з нами для організації турнірів та отримання інформації
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Contact Information */}
            <div className="space-y-6">
              <Card className="football-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Phone className="w-5 h-5 text-football-green" />
                    <span>Зв'язок з нами</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-football-green" />
                    <div>
                      <div className="font-medium">Телефон</div>
                      <div className="text-gray-600 dark:text-gray-400">+380 44 123 45 67</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-football-green" />
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-gray-600 dark:text-gray-400">info@footballmanager.ua</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-football-green" />
                    <div>
                      <div className="font-medium">Адреса</div>
                      <div className="text-gray-600 dark:text-gray-400">м. Київ, вул. Спортивна, 1</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="football-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-football-green" />
                    <span>Години роботи</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Понеділок - П'ятниця</span>
                    <span className="font-medium">09:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Субота</span>
                    <span className="font-medium">10:00 - 16:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Неділя</span>
                    <span className="font-medium">Вихідний</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Services and Pricing */}
            <div className="space-y-6">
              <Card className="football-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-football-green" />
                    <span>Тарифи на участь</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-football-green" />
                        <span>Реєстрація команди</span>
                      </div>
                      <span className="font-semibold">500 грн</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Trophy className="w-4 h-4 text-football-green" />
                        <span>Організація турніру</span>
                      </div>
                      <span className="font-semibold">5000 грн</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-football-green" />
                        <span>Технічна підтримка</span>
                      </div>
                      <span className="font-semibold">Безкоштовно</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      * Ціни можуть змінюватися залежно від масштабу турніру
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="football-card">
                <CardHeader>
                  <CardTitle>Створити турнір</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    Хочете організувати власний футбольний турнір? Ми допоможемо вам на кожному етапі:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-football-green rounded-full"></div>
                      <span>Планування та налаштування турніру</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-football-green rounded-full"></div>
                      <span>Реєстрація команд та гравців</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-football-green rounded-full"></div>
                      <span>Складання розкладу матчів</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-football-green rounded-full"></div>
                      <span>Live-трансляції та статистика</span>
                    </li>
                  </ul>
                  <Button className="w-full bg-football-gradient hover:bg-football-green-dark">
                    <Mail className="w-4 h-4 mr-2" />
                    Зв'язатися з організаторами
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contacts;
